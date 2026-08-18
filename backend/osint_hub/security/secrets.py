import base64
from functools import lru_cache

from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

from osint_hub.config import get_settings

# Salt is static because the key must be re-derivable from SECRET_KEY alone across
# restarts; the actual secret entropy comes from SECRET_KEY, not this salt.
_KDF_SALT = b"osint-hub-fernet-kdf"


@lru_cache
def _fernet() -> Fernet:
    settings = get_settings()
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=_KDF_SALT, iterations=480_000)
    key = base64.urlsafe_b64encode(kdf.derive(settings.secret_key.encode("utf-8")))
    return Fernet(key)


def encrypt_secret(plaintext: str) -> bytes:
    return _fernet().encrypt(plaintext.encode("utf-8"))


def decrypt_secret(ciphertext: bytes) -> str:
    return _fernet().decrypt(ciphertext).decode("utf-8")
