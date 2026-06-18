# Todo

- [ ] Use the Credit and Debit api on Appzone documentation to create a credit and debit transaction when a user makes a transaction using NIBSS interbank or any other thing that does not automatically show on the core banking.
- [x] Test Comono api is working
- [x] Why is email not sending? Test that
- [x] Review transfer and deposit procedures
- [ ] Inform Nibss that IGree callback might change
- [ ] Ask about bvn partial details phone 1 and phone 2. What's the difference?

## Moola Business Todo

Questions:

- What is balances and settlements?

### Moola Business Authentication and KYC API Endpoints

- [x] Business Sign In  (29th Aug 2023)

  DTO:

  - email or phone
  - password

  Notes:
  
  - If phone is not yet verified send otp to phone.
  - If Phone is verified but setup is not yet complete, return token and business data which must contain setup stage.

  Response:

  - token
  - business data

- [x] Business Sign Up  (29th Aug 2023)

  DTO:

  - email
  - password
  - phone
  - business name
  - full name
  - bvn? For face match bvn is required

  Notes:

  - Send otp to phone

  Response:

  - success message

- [x] Business Verify Phone  (29th Aug 2023)

  DTO:

  - phone
  - otp

  Response:

  - token

- [x] Business BVN IGree Verification / VerifyMe  (30th Aug 2023)

  DTO:

  - email
  - otp

  Response:

  - success message

- [x] Business Face Match  (31th Aug 2023)

  DTO:

  - image

  Response:

  - success message

- [x] Business Create Pin  (1st Sept 2023)

  DTO:

  - pin

  Response:

  - success message

- [x] Business Profile Setup  (1st Sept 2023)

  DTO:

  - first name
  - middle name
  - surname
  - gender
  - dob
  - country
  - state
  - city
  - local government
  - address

  Response:

  - success message

- [x] Business Owner ID Verification  (4th Sept 2023)

  DTO:

  - id type (options: national id, drivers license, voters card, international passport)
  - id number
  - id image (url)

  Response:

  - success message

- [x] Business Identify Verification  (4th Sept 2023)

  DTO:

  - business name
  - business address
  - business registration number
  - business registration image (url)

  Response:

  - success message

### Moola Business Account API Endpoints

- [ ] Business Account Balance

  Response:

  - balance

### Moola Business Store API Endpoints

- [ ] Business Store Details

  Response:

  - store details

- [ ] Business Store Update

  DTO:

  - business name
  - store tagline
  - store description
  - store logo (url) (optional)
  - store banner (url) (optional)
  - store address
  - store city
  - store state
  - store country
  - store zip code (optional)
  - store phone
  - store currency (options: naira, dollar, euro, pounds, cedis, others)

  Response:

  - success message

### Moola Business Taxes API Endpoints

- [ ] Business Taxes

  Query Params:

  - name (optional)
  - description (optional)

  Response:

  - taxes

- [ ] Business Tax Details
  
    DTO:
  
  - tax id
  
    Response:
  
  - tax details

- [ ] Add Business Tax

  DTO:

  - name
  - description (optional)
  - type (options: percentage, fixed)
  - amount
  - compound (default: false)

  Response:

  - success message

- [ ] Update Business Tax

  DTO:

  - tax id
  - name
  - description (optional)
  - amount
  - type (options: percentage, fixed)
  - compound (default: false)

  Response:

  - success message

### Moola Business Shipping API Endpoints

- [ ] Business Shipping

  Query Params:

  - title (optional)
  - description (optional)

  Response:

  - shipping

- [ ] Business Shipping Details

  DTO:

  - shipping id

  Response:

  - shipping details

- [ ] Add Business Shipping

  DTO:

  - title
  - description (optional)
  - amount
  - visible_on_web_checkout (default: true)

  Response:

  - success message

### Moola Business Notifications API Endpoints

Notes:

- Notifications are sent to the business email or phone as required.
- Notifications can be actions or alerts.
- The types are to be documented clearly.

- [ ] Business Notifications

  Response:

  - notifications

### Moola Business Transactions API Endpoints

- [ ] Business Transactions

  Response:

  - transactions

- [ ] Business Transaction Details

  DTO:

  - transaction id

  Response:

  - transaction details

- [ ] Business Refunds
  
  Response:
  
  - refunds

- [ ] Business Refund Details

  DTO:

  - refund id

  Response:

  - refund details

### Moola Business Orders API Endpoints

- [ ] Business Orders

  Query Params:

  - transaction id (optional)
  - name (optional)
  - email (optional)

  Response:

  - orders

- [ ] Business Order Details

  DTO:

  - order id

  Response:

  - order details

- [ ] Create Business Order

  DTO:

  - customer id (optional)
  - channel (options: pos, web, mobile)
  - date
  - description (optional)
  - products
    - product id
    - quantity
    - price
    - discount (optional)
    - tax (optional)
  - payment_status (options: paid, unpaid, partial) (default: unpaid)
  - payment_method (options: cash, card, bank transfer, bank deposit, pos, mobile money, ussd, flutterwave, paystack, jumia, konga, whatsapp, facebook, instagram, others) (optional)
  - amount_paid (optional)

  Response:

  - success message

### Moola Business Products API Endpoints

Questions:

- What are product options?
- What are product variants?

- [ ] Business Products

  Query Params:

  - name (optional)

  Response:

  - products

- [ ] Business Product Details

  DTO:

  - product id

  Response:

  - product details

- [ ] Add Business Product

  DTO:

  - name
  - description (optional)
  - price
  - quantity
  - images (optional) (array of objects with url, size, extension, dimensions) Note: max 5 images
  - categories (optional)
  - tax_type (options: percentage, fixed) (default: percentage)
  - tax (default: 0)
  - discount_type (options: percentage, fixed) (default: percentage)
  - discount (default: 0)

  Response:

  - success message

- [ ] Get Business Product Categories

  Query Params:

  - name (optional)

  Response:

  - categories

- [ ] Add Business Product Category

  DTO:

  - name

  Response:

  - success message

### Moola Business Customers API Endpoints

- [ ] Business Customers

  Query Params:

  - transaction id (optional)
  - name (optional)
  - email (optional)
  - phone (optional)

  Response:

  - customers

- [ ] Business Customer Details

  DTO:

  - customer id

  Response:

  - customer details

- [ ] Add Business Customer

  DTO:

  - name
  - phone
  - email (optional)
  - social media (optional)
  - address
  - city
  - state
  - country
  - zip code (optional)
  - use_as_shipping_address (default: false)

  Response:

  - success message

- [ ] Update Business Customer

  DTO:

  - customer id
  - name
  - phone
  - email (optional)
  - social media (optional)
  - address
  - city
  - state
  - country
  - zip code (optional)
  - use_as_shipping_address (default: false)

  Response:

  - success message

- [ ] Get Business Customer Orders (purchase history)

  DTO:

  - customer id

  Response:

  - orders

### Moola Business Beneficiaries API Endpoints

- [ ] Business Beneficiaries

  Query Params:

  - beneficiary name (optional)
  - bank name (optional)

  Response:

  - beneficiaries

- [ ] Business Beneficiary Details

  DTO:

  - beneficiary id

  Response:

  - beneficiary details

- [ ] Add Business Beneficiary

  DTO:

  - currency (options: naira, dollar, euro, pounds, cedis, others)
  - bank
  - account number
  - account name

  Response:

  - success message

### Moola Business Invoices API Endpoints

Questions:

- Why is there two additional details for invoices and customer stage?

- [ ] Business Invoices

  Query Params:

  - invoice number (optional)
  - name (optional)
  - email (optional)

  Response:

  - invoices

- [ ] Business Invoice Details

  DTO:

  - invoice id

  Response:

  - invoice details

- [ ] Create Business Invoice

  DTO:

  - currency (options: naira, dollar, euro, pounds, cedis, others)
  - bank
  - invoice_image (url)
  - address (optional)
  - city (optional)
  - state (optional)
  - country (optional)
  - zip code (optional)
  - customer id
  - title
  - due date
  - unit price
  - quantity
  - tax_type (options: percentage, fixed) (default: percentage)
  - tax (default: 0)
  - discount_type (options: percentage, fixed) (default: percentage)
  - discount (default: 0)
  - regards (optional)

  Response:

  - success message

### Moola Business Transfer API Endpoints

- [ ] Business Transfer

  Query Params:

  - transaction id (optional)
  - name (optional)
  - email (optional)
  - phone (optional)

  Response:

  - transfers

- [ ] Business Transfer Details

  DTO:

  - transfer id

  Response:

  - transfer details

- [ ] Moola Transfer

  Note:

  - beneficiary id or username or account number is required
  - Send transaction email to beneficiary and business

  DTO:

  - amount
  - description
  - beneficiary id (optional)
  - username (optional)
  - account number (optional)
  - transaction pin

  Response:

  - success message

- [ ] External Bank Transfer

  DTO:

  - amount
  - description
  - bank
  - account number
  - transaction pin

  Response:

  - success message

- [ ] Add to beneficiary

  DTO:
  - transfer id

  Response:

  - success message

### Moola Business Expenses API Endpoints

- [ ] Business Expenses

  Query Params:

  - name (optional)

  Response:

  - expenses

- [ ] Business Expense Details

  DTO:

  - expense id

  Response:

  - expense details

- [ ] Add Business Expense

  DTO:

  - name
  - description (optional)
  - amount
  - date
  - image (url) (optional)

  Response:

  - success message

- [ ] Update Business Expense

  DTO:

  - expense id
  - name
  - description (optional)
  - amount
  - date
  - image (url) (optional)

  Response:

  - success message

### Moola Business Bulk Payments API Endpoints

- [ ] Business Bulk Payments

  Query Params:

  - title (optional)

  Response:

  - bulk payments

- [ ] Business Bulk Payment Details

  DTO:

  - bulk payment id

  Response:

  - bulk payment details

- [ ] Create Business Bulk Payment

  DTO:

  - title
  - description (optional)
  - amount
  - beneficiaries (array of ids)
  - start_date (optional)
  - frequency (options: daily, weekly, monthly, yearly) (optional)

  Response:

  - success message

- [ ] Update Business Bulk Payment

  DTO:

  - bulk payment id
  - title
  - description (optional)
  - amount
  - beneficiaries (array of ids)
  - start_date (optional)
  - frequency (options: one-time, daily, weekly, monthly, yearly) (optional)

  Response:

  - success message

- [ ] Initialize Business Bulk Payment

  DTO:

  - bulk payment id
  - transaction pin

  Response:

  - success message

### Moola Business Settings API Endpoints

- [ ] Upload Business Logo

  DTO:

  - logo (url)

  Response:

  - success message

- [ ] Get Business Profile

  Response:

  - business profile

- [ ] Update Business Preferences

  DTO:

  - transaction fees (options 1, 2) (1: Charge my customers, 2: Charge me)
  - email_me_for_new_transaction (default: true)
  - email_customer_for_new_transaction (default: true)

- [ ] Update Payment Options

  DTO:

  - payment options (options: cash, card, bank transfer, bank deposit, pos, mobile money, ussd, flutterwave, paystack, jumia, konga, whatsapp, facebook, instagram, others)
  NOTE: Can select multiple options. Use comma to separate options

- [ ] Change Business Password

  DTO:

  - old password
  - new password

  Response:

  - success message

- [ ] Change Business Pin

  DTO:

  - old pin
  - new pin

  Response:

  - success message

- [ ] Discounts

  Query Params:

  - name (optional)

  Response:

  - discounts

- [ ] Discount Details

  DTO:

  - discount id

  Response:

  - discount details

- [ ] Add Discount

  DTO:

  - name
  - description (optional)
  - type (options: percentage, fixed)
  - amount
  - products (optional) (array of ids)
  - categories (optional) (array of ids)
  - start date
  - end date

  Response:

  - success message

- [ ] Update Discount

  DTO:

  - discount id
  - name
  - description (optional)
  - type (options: percentage, fixed)
  - amount
  - products (optional) (array of ids)
  - categories (optional) (array of ids)
  - start date
  - end date

  Response:

  - success message

- [ ] Coupons

  Query Params:

  - name (optional)

  Response:

  - coupons

- [ ] Coupon Details

  DTO:

  - coupon id

  Response:

  - coupon details

- [ ] Add Coupon

  DTO:

  - code
  - description (optional)
  - type (options: percentage, fixed)
  - amount
  - max_amount (optional) Note: the total amount of the coupon cannot exceed this amount
  - products (optional) (array of ids)
  - categories (optional) (array of ids)
  - start date
  - end date
  - number of uses (optional)
  - number of uses per customer (optional)

  Response:

  - success message

### Moola Business Analytics API Endpoints

- [ ] Business Home Page Analytics

  DTO:

  - from
  - to

  Response:

  - analytics data (total website visits, total customers, total orders, total products)
