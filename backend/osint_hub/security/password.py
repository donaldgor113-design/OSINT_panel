import bcrypt

BCRYPT_ROUNDS = 12
_SALT_PREFIX_LEN = 29  # "$2b$12$" + 22-char salt, per bcrypt's modular crypt format


def hash_password(password: str) -> tuple[str, str]:
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt(rounds=BCRYPT_ROUNDS))
    hashed_str = hashed.decode("utf-8")
    return hashed_str, hashed_str[:_SALT_PREFIX_LEN]


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def validate_password_strength(password: str) -> list[str]:
    errors = []
    if len(password) < 12:
        errors.append("Пароль має містити щонайменше 12 символів")
    if not any(c.isupper() for c in password):
        errors.append("Пароль має містити хоча б одну велику літеру")
    if not any(c.islower() for c in password):
        errors.append("Пароль має містити хоча б одну малу літеру")
    if not any(c.isdigit() for c in password):
        errors.append("Пароль має містити хоча б одну цифру")
    return errors
