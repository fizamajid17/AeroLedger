"""
utils/pdf_generator.py

CHANGE IN THIS VERSION (airport name fix):
  Airport name is no longer hardcoded as "Calicut International Airport
  Authority". It's now read from breach_result["airport_name"], which
  flows in from: SLA PDF (extracted by LLM in rag.py) -> clause cache ->
  breach_detector.py -> this dict. Whatever airport is in the SLA you
  ingest is the airport that shows up on the invoice PDF.

  Falls back to "Unknown Airport" only if airport_name is genuinely
  missing (e.g. old breach_result from before this fix, or SLA that
  truly had no airport name in it).
"""

import os
from datetime import datetime, timedelta
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT


def generate_invoice_pdf(breach_result: dict) -> str:
    airport_name  = breach_result.get("airport_name") or "Unknown Airport"
    vendor        = breach_result.get("vendor", "Unknown Vendor")
    metric        = breach_result.get("metric", "Unknown Metric")
    threshold     = breach_result.get("threshold_minutes", 0)
    penalty_each  = breach_result.get("penalty_per_breach", 0)
    currency      = breach_result.get("currency", "INR")
    breaches      = breach_result.get("breaches", [])
    total_penalty = breach_result.get("total_penalty", 0)

    # Build a clean header line. If the airport name already ends with
    # "Authority" we don't double it up; otherwise we append
    # "Authority" for a consistent invoice header look.
    header_text = airport_name
    if not header_text.lower().endswith("authority"):
        header_text = f"{airport_name} Authority"

    # Invoice metadata
    invoice_date  = datetime.now()
    invoice_no    = f"AERO-{invoice_date.strftime('%Y%m%d%H%M%S')}"
    due_date      = invoice_date + timedelta(days=15)

    os.makedirs("invoices", exist_ok=True)
    filename      = f"invoices/invoice_{invoice_no}.pdf"
    doc           = SimpleDocTemplate(filename, pagesize=A4,
                        rightMargin=20*mm, leftMargin=20*mm,
                        topMargin=20*mm, bottomMargin=20*mm)
    styles        = getSampleStyleSheet()
    story         = []

    # ── Header ────────────────────────────────────────────────────────────────
    header_style = ParagraphStyle("header", fontSize=16, fontName="Helvetica-Bold",
                                   alignment=TA_CENTER, spaceAfter=2*mm)
    sub_style    = ParagraphStyle("sub", fontSize=10, fontName="Helvetica",
                                   alignment=TA_CENTER, spaceAfter=6*mm, textColor=colors.grey)
    story.append(Paragraph(header_text, header_style))
    story.append(Paragraph("Ground Handling SLA Compliance", sub_style))

    # Divider
    story.append(Table([[""]], colWidths=[170*mm],
        style=TableStyle([("LINEBELOW", (0,0), (-1,-1), 1, colors.HexColor("#003366"))])))
    story.append(Spacer(1, 5*mm))

    # ── Invoice meta ──────────────────────────────────────────────────────────
    title_style = ParagraphStyle("title", fontSize=13, fontName="Helvetica-Bold",
                                  spaceAfter=4*mm, textColor=colors.HexColor("#003366"))
    story.append(Paragraph("PENALTY INVOICE", title_style))

    meta_data = [
        ["Invoice No.",  invoice_no,       "Invoice Date", invoice_date.strftime("%d %b %Y")],
        ["Vendor",       vendor,           "Payment Due",  due_date.strftime("%d %b %Y")],
        ["Service",      metric,           "Currency",     currency],
        ["SLA Threshold", f"{threshold} minutes", "Penalty/Breach", f"{currency} {penalty_each:,}"],
    ]
    meta_table = Table(meta_data, colWidths=[38*mm, 55*mm, 38*mm, 39*mm])
    meta_table.setStyle(TableStyle([
        ("FONTNAME",    (0,0), (-1,-1), "Helvetica"),
        ("FONTNAME",    (0,0), (0,-1), "Helvetica-Bold"),
        ("FONTNAME",    (2,0), (2,-1), "Helvetica-Bold"),
        ("FONTSIZE",    (0,0), (-1,-1), 9),
        ("TEXTCOLOR",   (0,0), (0,-1), colors.HexColor("#003366")),
        ("TEXTCOLOR",   (2,0), (2,-1), colors.HexColor("#003366")),
        ("ROWBACKGROUNDS", (0,0), (-1,-1), [colors.HexColor("#f0f4f8"), colors.white]),
        ("GRID",        (0,0), (-1,-1), 0.3, colors.HexColor("#cccccc")),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("TOPPADDING",  (0,0), (-1,-1), 4),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 6*mm))

    # ── Breach table ──────────────────────────────────────────────────────────
    story.append(Paragraph("Breach Detail", title_style))

    table_header = ["#", "Date", "Flight No.", "Actual (min)", "Threshold (min)", "Penalty (Rs.)"]
    table_data   = [table_header]

    for i, b in enumerate(breaches, 1):
        table_data.append([
            str(i),
            b.get("date", ""),
            b.get("flight_number", ""),
            str(b.get("actual_minutes", "")),
            str(b.get("threshold_minutes", "")),
            f"{b.get('penalty', 0):,}",
        ])

    # Total row
    table_data.append(["", "", "", "", "TOTAL", f"{total_penalty:,}"])

    col_widths = [10*mm, 28*mm, 30*mm, 32*mm, 35*mm, 35*mm]
    breach_table = Table(table_data, colWidths=col_widths, repeatRows=1)
    breach_table.setStyle(TableStyle([
        # Header
        ("BACKGROUND",    (0,0), (-1,0), colors.HexColor("#003366")),
        ("TEXTCOLOR",     (0,0), (-1,0), colors.white),
        ("FONTNAME",      (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,0), 9),
        ("ALIGN",         (0,0), (-1,0), "CENTER"),
        # Body
        ("FONTNAME",      (0,1), (-1,-2), "Helvetica"),
        ("FONTSIZE",      (0,1), (-1,-2), 8.5),
        ("ROWBACKGROUNDS",(0,1), (-1,-2), [colors.white, colors.HexColor("#f7f9fc")]),
        ("ALIGN",         (0,1), (-1,-1), "CENTER"),
        # Total row
        ("BACKGROUND",    (0,-1), (-1,-1), colors.HexColor("#e8f0fe")),
        ("FONTNAME",      (0,-1), (-1,-1), "Helvetica-Bold"),
        ("FONTSIZE",      (0,-1), (-1,-1), 9),
        ("TEXTCOLOR",     (4,-1), (5,-1), colors.HexColor("#cc0000")),
        # Grid
        ("GRID",          (0,0), (-1,-1), 0.3, colors.HexColor("#cccccc")),
        ("LINEBELOW",     (0,0), (-1,0), 1, colors.HexColor("#003366")),
        ("BOTTOMPADDING", (0,0), (-1,-1), 4),
        ("TOPPADDING",    (0,0), (-1,-1), 4),
    ]))
    story.append(breach_table)
    story.append(Spacer(1, 6*mm))

    # ── Summary box ───────────────────────────────────────────────────────────
    summary_data = [
        [f"Total Breaches: {len(breaches)}",
         f"Total Penalty Due: {currency} {total_penalty:,}",
         f"Payment Due By: {due_date.strftime('%d %b %Y')}"]
    ]
    summary_table = Table(summary_data, colWidths=[55*mm, 65*mm, 50*mm])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND",    (0,0), (-1,-1), colors.HexColor("#003366")),
        ("TEXTCOLOR",     (0,0), (-1,-1), colors.white),
        ("FONTNAME",      (0,0), (-1,-1), "Helvetica-Bold"),
        ("FONTSIZE",      (0,0), (-1,-1), 9),
        ("ALIGN",         (0,0), (-1,-1), "CENTER"),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("TOPPADDING",    (0,0), (-1,-1), 6),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 6*mm))

    # ── Footer ────────────────────────────────────────────────────────────────
    footer_style = ParagraphStyle("footer", fontSize=8, textColor=colors.grey,
                                   alignment=TA_CENTER, spaceAfter=2*mm)
    story.append(Paragraph(
        "Undisputed penalty invoices payable within 15 days of issuance. "
        "Vendors may raise dispute within 7 calendar days of notification. "
        f"Ref: Section 7, {airport_name} Ground Handling SLA.", footer_style))
    story.append(Paragraph(
        f"Generated by AeroLedger | {invoice_date.strftime('%d %b %Y %H:%M')}",
        ParagraphStyle("gen", fontSize=7, textColor=colors.lightgrey, alignment=TA_CENTER)))

    doc.build(story)
    return filename