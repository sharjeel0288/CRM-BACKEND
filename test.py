from fpdf import FPDF

# Load the JSON data
invoice_data = {
    "success": true,
    "message": "Quote PDF details generated successfully",
    "data": {
        "quoteData": {
            "id": 1,
            "client_id": 1,
            "number": "1691497399368-7635",
            "quote_current_date": "2023-08-07T19:00:00.000Z",
            "status": 1,
            "added_by_employee": 1,
            "expiry_date": "2023-12-30T19:00:00.000Z",
            "terms_and_condition": "Terms and conditions...",
            "payment_terms": "Payment terms...",
            "execution_time": "2 weeks",
            "bank_details": "Bank details...",
            "payment_mode_id": 2,
            "pdf_file_name": "quote_1.pdf",
            "client_email": "john.doe@example.com",
            "employee_email": "123456789@example.com"
        },
        "quoteItems": [
            {
                "id": 1,
                "quote_id": 1,
                "item_name": "Item 1",
                "item_description": "Description for Item 1",
                "item_quantity": 2,
                "item_xdim": 10,
                "item_ydim": 15,
                "item_price": 100,
                "item_subtotal": 200,
                "item_tax": 20,
                "item_total": 220
            },
            {
                "id": 2,
                "quote_id": 1,
                "item_name": "Item 2",
                "item_description": "Description for Item 2",
                "item_quantity": 3,
                "item_xdim": 5,
                "item_ydim": 7,
                "item_price": 50,
                "item_subtotal": 150,
                "item_tax": 15,
                "item_total": 165
            }
        ],
        "settings": {
            "logo_img": null,
            "stamp_img": "img.png",
            "name": "New VAT number here",
            "address": "New VAT number here",
            "vat_no": "New VAT number here",
            "id": 1
        },
        "client": {
            "id": 1,
            "fname": "John",
            "lname": "John",
            "phone": "1234567890",
            "email": "john.doe@example.com",
            "date": null,
            "added_by_employee": null,
            "company_name": null
        },
        "employee": {
            "id": 1,
            "name": "John",
            "surname": "Doe",
            "birthday": "1989-12-31T19:00:00.000Z",
            "department": "accounts",
            "position": "Manager",
            "phone": "1234567890",
            "email": "123456789@example.com",
            "password": "$2b$10$b3XluLRrDUX.vOI7krgfauiOYjUhCEzjmQJE/mNeXzocLaUzYfxjS"
        },
        "status": "Draft",
        "paymentMode": {
            "id": 2,
            "name": "Credit Card",
            "description": "Payment via credit card",
            "is_enabled": 1,
            "is_default": 0
        },
        "Summarry": {
            "subtotal": 385,
            "vatRate": 0.1,
            "tax": 38.5,
            "total": 423.5
        }
    }
}

# Create PDF document
pdf = FPDF()
pdf.add_page()
pdf.set_auto_page_break(auto=True, margin=15)
pdf.set_font("Arial", size=12)

# Header
pdf.cell(0, 10, "Invoice", 0, 1, "C")

# Invoice Details
pdf.cell(50, 10, "Invoice Number:", 0)
pdf.cell(0, 10, invoice_data["data"]["quoteData"]["number"], 0, 1)

# Client Details
pdf.cell(50, 10, "Client:", 0)
pdf.cell(0, 10, f"{invoice_data['data']['client']['fname']} {invoice_data['data']['client']['lname']}", 0, 1)
pdf.cell(50, 10, "Email:", 0)
pdf.cell(0, 10, invoice_data["data"]["quoteData"]["client_email"], 0, 1)
pdf.cell(50, 10, "Phone:", 0)
pdf.cell(0, 10, invoice_data["data"]["client"]["phone"], 0, 1)

# Invoice Items
pdf.ln(10)
pdf.cell(0, 10, "Invoice Items:", 0, 1)
for item in invoice_data["data"]["quoteItems"]:
    pdf.cell(50, 10, item["item_name"], 0)
    pdf.cell(30, 10, str(item["item_quantity"]), 0)
    pdf.cell(40, 10, f"${item['item_price']:.2f}", 0)
    pdf.cell(0, 10, f"${item['item_total']:.2f}", 0, 1)

# Summary
pdf.ln(10)
pdf.cell(0, 10, "Summary:", 0, 1)
pdf.cell(0, 10, f"Subtotal: ${invoice_data['data']['Summarry']['subtotal']:.2f}", 0, 1)
pdf.cell(0, 10, f"Tax ({invoice_data['data']['Summarry']['vatRate']*100}%): ${invoice_data['data']['Summarry']['tax']:.2f}", 0, 1)
pdf.cell(0, 10, f"Total: ${invoice_data['data']['Summarry']['total']:.2f}", 0, 1)

# Save the PDF
pdf.output("invoice.pdf")

print("Invoice generated successfully!")
