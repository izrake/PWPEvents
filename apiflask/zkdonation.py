import datetime
import json
import os
import shutil
import time
import traceback

import maya
import msgpack
from flask import  Flask, jsonify, make_response,request
from nucypher.characters.lawful import Ursula, Enrico, Bob
from nucypher.config.characters import AliceConfiguration
from nucypher.config.constants import TEMPORARY_DOMAIN
from nucypher.crypto.kits import UmbralMessageKit
from nucypher.crypto.powers import DecryptingPower, SigningPower
from nucypher.datastore.keypairs import DecryptingKeypair, SigningKeypair
from nucypher.network.middleware import RestMiddleware
from umbral.keys import UmbralPublicKey, UmbralPrivateKey
from flask_cors import CORS, cross_origin

from utils import nocache, createGenericAlicia, generate_subscribers_keys

app = Flask(__name__)
CORS(app)



@ app.route("/")
def welcome():
    return "welcome to zkDonation"


@app.route("/encrypt/",methods=["POST"])
@nocache
def encrypt_location():
    req = request.get_json()
    print(req)
    print("i am from encryption data")
    createAliciaAndEncrypt(req["event_uuid"],req["data_enc"],req["sender"])

    return  make_response(req)

@app.route("/generate_keys/", methods=["POST"])
def generate_keys():
    req = request.get_json()
    sub_pub,sub_pvt = generate_subscribers_keys(req["user_uuid"])
    print("i am going to generate key for")
    jsonData = {
        "pub":sub_pub,
        "pvt":sub_pvt
    }
    return make_response(jsonData)

@app.route("/assign_policy/",methods=["POST"])
def assign_policy():
    req = request.get_json()
    res = assignPolicyToSubscriber(req["subscriber"], req["sub_uuid"], req["event_uuid"], req["public_key_user"], req["public_sign_user"])
    return  make_response(res)

@app.route("/decrypt_data/",methods=["POST"])
def decrypt_data():
    req = request.get_json()
    text = createBobToResolveData(req["sub_uuid"], req["subscriber"], req["event_uuid"], req["sub_private_key"], req["sub_signer_key"])

    dec_data = {
        'data':text
    }
    return make_response(dec_data)

def createAliciaAndEncrypt(event_uuid,dataToEnc,sender):

    # we have to create polices for every
    label = event_uuid.encode()
    policy_pubkey = alicia.get_policy_encrypting_key_from_label(label)
    print("The policy public key for "
          "label '{}' is {}".format(label.decode("utf-8"), policy_pubkey.to_bytes().hex()))
    enc_data = generateEncDataUsingEnrico(policy_pubkey, dataToEnc, sender,event_uuid, True)
    return enc_data


def generateEncDataUsingEnrico(pub_policy_key, dataToEnc,sender,uuid,save_as_file:bool = False):
    data_source =  Enrico(policy_encrypting_key=pub_policy_key)
    now =time.time()
    data_source_public_key = bytes(data_source.stamp)
    # create json formatted data of the location for specific user
    location_data = {
        'data_enc':dataToEnc,
        'timestamp':now,
        'sender': sender
    }

    plaintext = msgpack.dumps(location_data,use_bin_type=True)
    message_kit, _signature = data_source.encrypt_message(plaintext)
    location_bytes = message_kit.to_bytes()
    data = {
        'data_source':data_source_public_key,
        'data':location_bytes
    }

    enc_data_alicia = uuid + '.msgpack'

    if save_as_file:
        with open(enc_data_alicia, "wb") as file:
            msgpack.dump(data, file, use_bin_type=True)

    return data

def assignPolicyToSubscriber(subsriber,sub_uuid,event_uuid,publicEnc, publicSign):
    label = event_uuid.encode()
    m, n = 1, 1
    subenc = UmbralPublicKey.from_bytes(bytes.fromhex(publicEnc))
    subsig = UmbralPublicKey.from_bytes(bytes.fromhex(publicSign))
    ourCurrentSubscriber = Bob.from_public_keys(verifying_key=subsig,
                                      encrypting_key=subenc,
                                      federated_only=True)
    policy_end_datetime = maya.now() + datetime.timedelta(days=5)
    print("Creating access policy for the Doctor...")
    policy = alicia.grant(bob=ourCurrentSubscriber,
                          label=label,
                          m=m,
                          n=n,
                          expiration=policy_end_datetime)
    print("Done!")

    print(ourCurrentSubscriber)

    policy_info = {
        "policy_pubkey": policy.public_key.to_bytes().hex(),
        "alice_sig_pubkey": bytes(alicia.stamp).hex(),
        "label": label.decode("utf-8"),
    }

    filename = sub_uuid + '-'+ subsriber + '.json'
    with open(filename, 'w') as f:
        json.dump(policy_info, f)

    return policy_info


def createBobToResolveData(sub_uuid,sender,event_uuid,sub_private_key,sub_signer_key):
    SEEDNODE_URI = "localhost:10151"
    # TODO: path joins?
    TEMP_DOCTOR_DIR = "{}/doctor-files".format(os.path.dirname(os.path.abspath(__file__)))

    # Remove previous demo files and create new ones
    shutil.rmtree(TEMP_DOCTOR_DIR, ignore_errors=True)

    ursula = Ursula.from_seed_and_stake_info(seed_uri=SEEDNODE_URI,
                                             federated_only=True,
                                             minimum_stake=0)
    # doctor private key

    encdoctor = UmbralPrivateKey.from_bytes(bytes.fromhex(sub_private_key))
    signdoctor = UmbralPrivateKey.from_bytes(bytes.fromhex(sub_signer_key))

    bob_enc_keypair = DecryptingKeypair(private_key=encdoctor)
    bob_sig_keypair = SigningKeypair(private_key=signdoctor)
    enc_power = DecryptingPower(keypair=bob_enc_keypair)
    sig_power = SigningPower(keypair=bob_sig_keypair)
    power_ups = [enc_power, sig_power]

    print("Creating the Doctor ...")

    doctor = Bob(
        domains={TEMPORARY_DOMAIN},
        federated_only=True,
        crypto_power_ups=power_ups,
        start_learning_now=True,
        abort_on_learning_error=True,
        known_nodes=[ursula],
        save_metadata=False,
        network_middleware=RestMiddleware(),
    )

    print("Doctor = ", doctor)

    # get alicia policy
    filename = sub_uuid + '-' + sender + '.json'
    with open(filename, 'r') as f:
        policy_data = json.load(f)

    policy_pubkey = UmbralPublicKey.from_bytes(bytes.fromhex(policy_data["policy_pubkey"]))
    alices_sig_pubkey = UmbralPublicKey.from_bytes(bytes.fromhex(policy_data["alice_sig_pubkey"]))
    label = policy_data["label"].encode()

    print("The Doctor joins policy for label '{}'".format(label.decode("utf-8")))
    doctor.join_policy(label, alices_sig_pubkey)

    data = msgpack.load(open(event_uuid + ".msgpack", "rb"), raw=False)
    message_kits = UmbralMessageKit.from_bytes(data['data'])
    data_source = Enrico.from_public_keys(
        verifying_key=data['data_source'],
        policy_encrypting_key=policy_pubkey
    )

    try:
        retrieved_plaintexts = doctor.retrieve(
                message_kits,
                label=label,
                enrico=data_source,
                alice_verifying_key=alices_sig_pubkey
            )

        plaintext = msgpack.loads(retrieved_plaintexts[0],raw=False)

            # Now we can get the heart rate and the associated timestamp,
            # generated by the heart rate monitor.
        location_decrypted = plaintext['data_enc']
        print(location_decrypted)
    except Exception as e:
            # We just want to know what went wrong and continue the demo
            traceback.print_exc()

    return location_decrypted


alicia = createGenericAlicia('i_am_new_alicia_from_bangalore_india')


