import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def send_dmca_email(
    to: str,
    subject: str,
    body: str,
    sender: str,
    password: str,
    smtp_host: str,
    smtp_port: int,
) -> bool:
    """
    Send a DMCA takedown notice email via SMTP.
    Returns True on success, False on failure.
    """
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = sender
        msg["To"] = to

        part = MIMEText(body, "plain")
        msg.attach(part)

        with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.login(sender, password)
            server.sendmail(sender, [to], msg.as_string())

        return True
    except Exception as e:
        print(f"[email_sender] Failed to send email: {e}")
        return False
