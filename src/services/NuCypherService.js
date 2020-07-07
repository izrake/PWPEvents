const ROOT_URL = "http://localhost:5000";

export default class NuCypherService {
  static getEncryptionKey = async (user_uuid) => {
    return fetch(`${ROOT_URL}/api/generate_keys/`, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      method: "POST",
      body: JSON.stringify({
        user_uuid,
      }),
    })
      .then((res) => res.json())
      .catch((err) => console.log(err));
  };

  static encryptData = async (data_enc, sender, event_uuid) => {
    return fetch(`${ROOT_URL}/api/encrypt/`, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      method: "POST",
      body: JSON.stringify({
        data_enc,
        sender,
        event_uuid,
      }),
    })
      .then((res) => res.json())
      .catch((err) => console.log(err));
  };

  static assignPolicy = async (
    subscriber,
    sub_uuid,
    event_uuid,
    public_key_user,
    public_sign_user
  ) => {
    return fetch(`${ROOT_URL}/api/assign_policy/`, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      method: "POST",
      body: JSON.stringify({
        subscriber,
        sub_uuid,
        event_uuid,
        public_key_user,
        public_sign_user,
      }),
    })
      .then((res) => res.json())
      .catch((err) => console.log(err));
  };

  static decryptData = async (
    subscriber,
    sub_uuid,
    event_uuid,
    sub_private_key,
    sub_signer_key,
    policy_pub_key,
    policy_sign_key,
    label
  ) => {
    return fetch(`${ROOT_URL}/api/decrypt_data/`, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      method: "POST",
      body: JSON.stringify({
        subscriber,
        sub_uuid,
        event_uuid,
        sub_private_key,
        sub_signer_key,
        policy_pub_key,
        policy_sign_key,
        label,
      }),
    })
      .then((res) => res.json())
      .catch((err) => console.log(err));
  };
}
