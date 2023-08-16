from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
import pandas as pd
import qrcode

# Sample data (Replace this with your actual data)
data = [
    ["#", "Item", "Dimension", "Unit", "Qty", "Rate", "Amount"],
    ["#", "Item", "Dimension", "Unit", 1, 123, 123],
    ["#", "Item", "Dimension", "Unit", 1, 123, 123],
    ["#", "Item", "Dimension", "Unit", 1, 123, 123],
    # ... Add the rest of the data rows here ...
]

# Calculate sub total and total
sub_total = sum(row[-1] for row in data[1:])
vat = sub_total * 0.05  # Assuming 5% VAT
total = sub_total + vat



# Create a PDF document
pdf_filename = "invoice.pdf"
doc = SimpleDocTemplate(pdf_filename, pagesize=letter)

# Create a table with the data
table = Table(data, colWidths=[20, 160, 80, 40, 40, 50, 60])

# Define table styles
table_style = TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.grey),  # Header background color
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),  # Header text color
    ('ALIGN', (0, 0), (-1, 0), 'CENTER'),  # Header text alignment
    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),  # Header font
    ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),  # Data row background color
    ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),  # Data row text color
    ('ALIGN', (0, 1), (-1, -1), 'CENTER'),  # Data row text alignment
    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),  # Data row font
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),  # Vertical alignment
    ('LINEBELOW', (0, 0), (-1, 0), 2, colors.black),  # Header underline
    ('GRID', (0, 0), (-1, -1), 1, colors.black),  # Table grid
])


table.setStyle(table_style)

# Create a title and address section (same as before)
styles = getSampleStyleSheet()
title = "ESTIMATE"
subtitle = "# ZCG-EST-001036/03/2023\nSENT\n"
address = (
    'asgasgasg'
)

title_para = Paragraph(title, styles['Title'])
subtitle_para = Paragraph(subtitle, styles['Normal'])
address_para = Paragraph(address, styles['Normal'])

# QR Code generation
invoice_no = "ZCG-EST-001036/03/2023"
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,
    border=4,
)

img = qrcode.make(invoice_no)

print(type(img))
print(img.size)
# <class 'qrcode.image.pil.PilImage'>
# (290, 290)

img.save('qrcode.png')


# Stamp image (replace 'stamp.png' with your stamp image)
stamp_img = "download.jpeg"
# Build the PDF
story = [
    Image('download.jpeg', width=100, height=100),
    Spacer(1, 30),
    Paragraph("ESTIMATE", styles['Title']),
    Spacer(1, 30),
    Paragraph("Zealcon Group", styles['Normal']),
    Paragraph("609 Park Lane Tower Business Bay", styles['Normal']),
    Paragraph("Dubai UAE", styles['Normal']),
    Paragraph("United Arab Emirates 37613", styles['Normal']),
    Paragraph("VAT Number: 100547351500003", styles['Normal']),
    Spacer(1, 50),
    Paragraph("to", styles['Normal']),
    Paragraph("Client Name", styles['Normal']),
    Paragraph("Client Company", styles['Normal']),
    Spacer(1, 50),
    table,
    Spacer(1, 20),
    Image('qrcode.png', width=100, height=100),  # QR code image
    Spacer(1, 20),
    Image('download.jpeg', width=100, height=100),   # Stamp image
    Spacer(1, 20),
]


doc.build(story)

print(f"PDF created: {pdf_filename}")
