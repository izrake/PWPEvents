import json
import os
import shutil

from flask import make_response
from functools import wraps, update_wrapper
from datetime import datetime

from nucypher.characters.lawful import Ursula
from nucypher.config.characters import AliceConfiguration
from nucypher.config.constants import TEMPORARY_DOMAIN
from umbral.keys import UmbralPrivateKey

SEEDNODE_URI = "localhost:10151"
def nocache(view):
    @wraps(view)
    def no_cache(*args, **kwargs):
        response = make_response(view(*args, **kwargs))
        response.headers['Last-Modified'] = datetime.now()
        response.headers['Cache-Control'] = 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0, max-age=0'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '-1'
        return response

    return update_wrapper(no_cache, view)



def createGenericAlicia(passphrase):
    print('createGenericAlicia')
    TEMP_ALICE_DIR = os.path.join('/', 'tmp', 'zkDonationFlaskApp')
    shutil.rmtree(TEMP_ALICE_DIR, ignore_errors=True)

    ursula = Ursula.from_seed_and_stake_info(seed_uri=SEEDNODE_URI,
                                             federated_only=True,
                                             minimum_stake=0)

    alice_config = AliceConfiguration(
        config_root=os.path.join(TEMP_ALICE_DIR),
        domains={TEMPORARY_DOMAIN},
        known_nodes={ursula},
        start_learning_now=False,
        federated_only=True,
        learn_on_same_thread=True,
    )

    alice_config.initialize(password=passphrase)

    alice_config.keyring.unlock(password=passphrase)
    alicia = alice_config.produce()

    alice_config.to_configuration_file()

    alicia.start_learning_loop(now=True)

    return alicia


def generate_subscribers_keys(uuid):
    enc_privkey = UmbralPrivateKey.gen_key()
    sig_privkey = UmbralPrivateKey.gen_key()

    subscriberPrivateKey = f"{uuid}.private.json"

    subscriberPublicKey  = f"{uuid}.public.json"
    subscriber_privkeys = {
        'enc': enc_privkey.to_bytes().hex(),
        'sig': sig_privkey.to_bytes().hex(),
    }

    enc_pubkey = enc_privkey.get_pubkey()
    sig_pubkey = sig_privkey.get_pubkey()
    subscriber_pubkeys = {
        'enc': enc_pubkey.to_bytes().hex(),
        'sig': sig_pubkey.to_bytes().hex()
    }
    return subscriber_pubkeys,subscriber_privkeys