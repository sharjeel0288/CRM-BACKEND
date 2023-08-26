// app\utils\validation.js


const { body } = require('express-validator');
const Joi = require('joi');

// Validation schema for client
const clientSchema = Joi.object({
  fname: Joi.string().required(),
  lname: Joi.string().required(),
  phone: Joi.string().pattern(/^[0-9]+(?:[-\s][0-9]+)*$/).required(),
  email: Joi.string().email().required(),
  date: Joi.date().allow(null),
  added_by_employee: Joi.string().allow('Admin').required(),
  company_name: Joi.string().required(),
});


const validateClient = (req, res, next) => {
  const { error } = clientSchema.validate(req.body);
  if (error) {
    console.log(error)
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};



// Validation schema for admin signup
const adminSignupSchema = Joi.object({
  fname: Joi.string().required(),
  lname: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
const validateAdminSignup = (req, res, next) => {
  const { error } = adminSignupSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};


const employeeSchema = Joi.object({
  name: Joi.string().required(),
  surname: Joi.string().required(),
  birthday: Joi.date().iso().required(),
  department: Joi.string().required(),
  position: Joi.string().required(),
  phone: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});


const validateEmployee = (req, res, next) => {
  const { error } = employeeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const announcementSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  email: Joi.string().required(),
  priority: Joi.number().integer().required(),
});
const validateAnnouncement = (req, res, next) => {
  const { error } = announcementSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ success: false, message: error.details[0].message });
  }

  next();
};






const quoteItemValidationSchema = Joi.object({
  item_name: Joi.string().required().messages({
    'any.required': 'Item name is required',
  }),
  item_description: Joi.string().required().messages({
    'any.required': 'Item description is required',
  }),
  item_quantity: Joi.number().integer().min(1).required().messages({
    'number.base': 'Invalid item quantity',
    'number.min': 'Item quantity must be at least 1',
    'any.required': 'Item quantity is required',
  }),
  item_xdim: Joi.number().required().messages({
    'any.required': 'Item X dimension is required',
  }),
  item_ydim: Joi.number().required().messages({
    'any.required': 'Item Y dimension is required',
  }),
  item_price: Joi.number().positive().required().messages({
    'number.base': 'Invalid item price',
    'any.required': 'Item price is required',
  }),
  item_subtotal: Joi.number().positive().required().messages({
    'number.base': 'Invalid item subtotal',
    'any.required': 'Item subtotal is required',
  }),
  item_tax: Joi.number().required().messages({
    'number.base': 'Invalid item tax',
    'any.required': 'Item tax is required',
  }),
  item_total: Joi.number().positive().required().messages({
    'number.base': 'Invalid item total',
    'any.required': 'Item total is required',
  }),
});

const validateQuoteItem = (req, res, next) => {
  const { error } = quoteItemValidationSchema.validate(req.body, { abortEarly: false });
  if (error) {
    const errors = error.details.map(detail => detail.message);
    return res.status(400).json({ success: false, errors });
  }
  next();
};


const quoteValidationSchema = Joi.object({
  client_email: Joi.string().email().required().messages({
    'string.email': 'Invalid client email',
    'any.required': 'Client email is required',
  }),
  status: Joi.number().integer().min(1).max(7).required().messages({
    'number.base': 'Invalid status value',
    'number.min': 'Invalid status value',
    'number.max': 'Invalid status value',
    'any.required': 'Status is required',
  }),
  employee_email: Joi.string().email().required().messages({
    'string.email': 'Invalid employee email',
    'any.required': 'Employee email is required',
  }),
  expiry_date: Joi.date().required().messages({
    'date.base': 'Invalid expiry date',
    'any.required': 'Expiry date is required',
  }),
  terms_and_condition: Joi.string().required().messages({
    'any.required': 'Terms and conditions are required',
  }),
  note: Joi.string().required().messages({
    'any.required': 'note are required',
  }),
  payment_terms: Joi.string().required().messages({
    'any.required': 'Payment terms are required',
  }),
  execution_time: Joi.string().required().messages({
    'any.required': 'Execution time is required',
  }),
  bank_details: Joi.string().required().messages({
    'any.required': 'Bank details are required',
  }),
  quoteItemsData: Joi.array().items(
    Joi.object({
      item_name: Joi.string().required().messages({
        'any.required': 'Item name is required',
      }),
      // Add more validation rules for quote items fields
    })
  ),

});

const validateQuote = (req, res, next) => {
  const { error: quoteError } = quoteValidationSchema.validate(req.body.quoteData, { abortEarly: false });
  if (quoteError) {
    const quoteErrors = quoteError.details.map(detail => detail.message);
    return res.status(400).json({ success: false, errors: quoteErrors });
  }

  // Validate quote items data
  const { error: itemsError } = Joi.array().min(1).items(
    quoteItemValidationSchema
  ).validate(req.body.quoteItemsData, { abortEarly: false });

  if (itemsError) {
    const itemsErrors = itemsError.details.map(detail => detail.message);
    return res.status(400).json({ success: false, errors: itemsErrors });
  }

  next();
};

const paymentModeSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().required(),
  is_enabled: Joi.boolean().required(),
  is_default: Joi.boolean().required(),
});

const validatePaymentMode = (req, res, next) => {
  const { error } = paymentModeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};


const invoiceSchema = Joi.object({
  invoiceData: Joi.object({
    client_email: Joi.string().email().required(),
    status: Joi.number().integer().min(1).max(7).required(),
    employee_email: Joi.string().email().required(),
    expiry_date: Joi.date().iso().required(),
    terms_and_condition: Joi.string().required(),
    payment_terms: Joi.string().required(),
    execution_time: Joi.string().required(),
    note: Joi.string().required(),
    bank_details: Joi.string().required(),
    isPerforma: Joi.number().integer().min(0).max(1).required(), // Add this line

  }).required(),
  invoiceItemsData: Joi.array().items(Joi.object({
    item_name: Joi.string().required(),
    item_description: Joi.string().required(),
    item_quantity: Joi.number().integer().min(1).required(),
    item_xdim: Joi.number().required(),
    item_ydim: Joi.number().required(),
    item_price: Joi.number().required(),
    item_subtotal: Joi.number().required(),
    item_tax: Joi.number().required(),
    item_total: Joi.number().required(),
  })).min(1).required(),
});


const validateInvoice = (req, res, next) => {
  const { error } = invoiceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const invoiceItemSchema = Joi.object({
  item_name: Joi.string().trim().required().messages({
    'any.required': 'Item name is required',
    'string.empty': 'Item name cannot be empty',
  }),
  item_description: Joi.string().trim().required().messages({
    'any.required': 'Item description is required',
    'string.empty': 'Item description cannot be empty',
  }),
  item_quantity: Joi.number().integer().min(1).required().messages({
    'any.required': 'Item quantity is required',
    'number.integer': 'Item quantity must be an integer',
    'number.min': 'Item quantity must be at least 1',
    'number.base': 'Item quantity must be a number',
  }),
  item_xdim: Joi.number().positive().required().messages({
    'any.required': 'Item dimension X is required',
    'number.base': 'Item dimension X must be a number',
    'number.positive': 'Item dimension X must be a positive number',
  }),
  item_ydim: Joi.number().positive().required().messages({
    'any.required': 'Item dimension Y is required',
    'number.base': 'Item dimension Y must be a number',
    'number.positive': 'Item dimension Y must be a positive number',
  }),
  item_price: Joi.number().positive().required().messages({
    'any.required': 'Item price is required',
    'number.base': 'Item price must be a number',
    'number.positive': 'Item price must be a positive number',
  }),
  item_subtotal: Joi.number().required().messages({
    'any.required': 'Item subtotal is required',
    'number.base': 'Item subtotal must be a number',
  }),
  item_tax: Joi.number().required().messages({
    'any.required': 'Item tax is required',
    'number.base': 'Item tax must be a number',
  }),
  item_total: Joi.number().required().messages({
    'any.required': 'Item total is required',
    'number.base': 'Item total must be a number',
  }),
});
const validateInvoiceItem = (req, res, next) => {
  const { error } = invoiceItemSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

const paymentSchema = Joi.object({
  invoice_id: Joi.number().integer().required(),
  date: Joi.date().iso().required(),
  amount: Joi.number().positive().precision(2).required(),
  payment_mode_id: Joi.number().integer().required(),
  reference: Joi.string().required(),
  description: Joi.string().required(),
});

const validatePayment = (req, res, next) => {
  const { error } = paymentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};
// Export the middleware function
module.exports = {
  validateAdminSignup,
  validateClient,
  validateEmployee,
  validateAnnouncement,
  validateQuote,
  validateQuoteItem,
  validatePaymentMode,
  validateInvoice,
  validatePayment,
  validateInvoiceItem,
};
