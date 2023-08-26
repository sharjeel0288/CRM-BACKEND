from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Spacer, Image, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from io import BytesIO

# Sample data
Items = [
    {
        "id": "1",
        "name": "Fixed + Openable W4141",
        "description": "Supply and Installation of ...",  # Truncated for brevity
        "dimension": "5580x3120mm. Qty: 1",
        "unit": "Sq.M",
        "qty": "17.41",
        "rate": "AED950",
        "total": "AED16,539.50",
    },
    # ... More items
]

additionalDetails = {
    "note": "• Company will not be responsible ...",  # Truncated for brevity
    "paymentTerms": "• 50 % advance along ...",  # Truncated for brevity
    "executionTime": "65 to 70 working days, ...",  # Truncated for brevity
    "bankDetails": [
        {
            "label": "Bank Name",
            "value": "Dubai Islamic Bank"
        },
        # ... More bank details
    ]
}

# Create a PDF document
buffer = BytesIO()
doc = SimpleDocTemplate(buffer, pagesize=landscape(letter))

# Create a list of elements to be added to the PDF
elements = []

# Add logo
logo = Image("qrcode.png", width=200, height=100)
elements.append(logo)

# Add company information
company_info = [
    "Four Seasons",
    "609 Park Lane Tower Business Bay",
    "Dubai UAE",
    "United Arab Emirates 37613",
    "Vat Number: 065498130315",
]
company_info_text = "<br/>".join(company_info)
elements.append(Paragraph(company_info_text, getSampleStyleSheet()["Normal"]))
elements.append(Spacer(1, 20))  # Add some space

# Create a table for items
item_data = [
    ["#", "Item", "Dimension", "Unit", "Qty", "Rate", "Amount"],
    ["1", "Item1", "5x10", "mg", "1", "14", "14"],
    # ... Add rows for each item
]

for item in Items:
    item_data.append([
        item["id"],
        f"{item['name']}\n{item['description']}",
        item["dimension"],
        item["unit"],
        item["qty"],
        item["rate"],
        item["total"]
    ])

item_table = Table(item_data, colWidths=[30, 200, 80, 40, 40, 60, 80])
item_table.setStyle(TableStyle([
    ("BACKGROUND", (0, 0), (-1, 0), colors.blue),
    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
    ("ALIGN", (0, 0), (-1, -1), "CENTER"),
    ("BOTTOMPADDING", (0, 0), (-1, 0), 12),
    ("BACKGROUND", (0, 1), (-1, -1), colors.beige),
    ("GRID", (0, 0), (-1, -1), 1, colors.black)
]))

elements.append(item_table)
elements.append(Spacer(1, 20))  # Add some space

# Add additional details
note = f"<b>Note:</b> {additionalDetails['note']}"
payment_terms = f"<b>Payment Terms:</b> {additionalDetails['paymentTerms']}"
execution_time = f"<b>Execution Time:</b> {additionalDetails['executionTime']}"

elements.append(Paragraph(note, getSampleStyleSheet()["Normal"]))
elements.append(Paragraph(payment_terms, getSampleStyleSheet()["Normal"]))
elements.append(Paragraph(execution_time, getSampleStyleSheet()["Normal"]))
elements.append(Spacer(1, 20))  # Add some space

# Build PDF document
doc.build(elements)

# Save the PDF
with open("invoice.pdf", "wb") as f:
    f.write(buffer.getvalue())
    print('done')
