import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from gemini import generate_dmca_notice
from email_sender import send_dmca_email

router = APIRouter()


class DMCARequest(BaseModel):
    url: str
    rights_holder: str = "BCCI / Board of Control for Cricket in India"
    content_type: str = "IPL 2026 Live Cricket Broadcast"


class DMCAResponse(BaseModel):
    notice: str
    sent: bool
    recipient: str


@router.post("/generate-dmca", response_model=DMCAResponse)
async def generate_dmca(req: DMCARequest):
    """
    Generate a DMCA takedown notice via Gemini API and email it to JioHotstar.
    """
    # Validate URL
    if not req.url or not req.url.startswith("http"):
        raise HTTPException(status_code=400, detail="A valid URL starting with http/https is required")

    # Generate notice via Gemini
    try:
        notice_text = await generate_dmca_notice(
            url=req.url,
            rights_holder=req.rights_holder,
            content_type=req.content_type,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Gemini API error: {str(e)}")

    # Send email
    recipient = os.getenv("DMCA_RECIPIENT_EMAIL", "copyright@jiohotstar.com")
    sender = os.getenv("DMCA_SENDER_EMAIL", "")
    password = os.getenv("SMTP_PASSWORD", "")
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))

    sent = False
    if sender and password:
        subject = f"DMCA Takedown Notice — IPL 2026 Live Stream Infringement: {req.url}"
        sent = send_dmca_email(
            to=recipient,
            subject=subject,
            body=notice_text,
            sender=sender,
            password=password,
            smtp_host=smtp_host,
            smtp_port=smtp_port,
        )
    else:
        print("[dmca_router] Email credentials not configured — skipping email send")

    return DMCAResponse(
        notice=notice_text,
        sent=sent,
        recipient=recipient,
    )
