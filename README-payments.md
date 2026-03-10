# Payment Management System

## Overview

The Payment Management System provides a comprehensive solution for tracking and managing payment transactions within the application. It allows administrators to view payment details, filter and search payments, check payment statuses, and more.

## Features

1. **Payment Listing**
   - View all payments in a paginated table
   - Filter payments by status (Pending, Completed, Failed, Refunded)
   - Filter payments by payment method (Mobile Money, Credit Card, PayPal, Bank Transfer)
   - Search payments by reference, business name, or user details
   - Sort payments by date, amount, etc.

2. **Payment Details**
   - View comprehensive details of a specific payment
   - See related business and user information
   - View bundle information if the payment is for a bundle
   - Links to navigate to related entities (business, user, bundle)

3. **Payment Status Management**
   - Refresh payment status for pending payments
   - Visual indicators for different payment statuses
   - Timestamps for payment creation and updates

4. **Data Visualization**
   - Colored badges for easy identification of payment statuses and methods
   - Responsive design for both desktop and mobile viewing

## Technical Implementation

### Components

1. **PaymentList**: Main component for displaying payments in a table with filtering and sorting options.
2. **PaymentDetail**: Component for showing detailed information about a specific payment.
3. **UI Components**: Reusable UI components like Loader, Pagination, Badge, etc.
4. **PageBreadcrumb**: Navigation component showing the current page in the hierarchy.

### API Endpoints

1. **/api/payments**: GET - Fetch payments with filtering and pagination
2. **/api/payments/[id]**: GET - Get details of a specific payment
3. **/api/payments/[id]/refresh**: POST - Refresh the status of a pending payment
4. **/api/seed/payments**: GET - Seed test payment data (for development)

### Data Model

The Payment entity includes the following key attributes:
- ID
- Amount and Currency
- Payment Status (PENDING, COMPLETED, FAILED, REFUNDED)
- Payment Method (MOBILE_MONEY, CREDIT_CARD, PAYPAL, BANK_TRANSFER)
- References to related Business, User, and Bundle
- Timestamps for creation and updates

## User Flow

1. User navigates to the Payments page
2. User can filter and search for specific payments
3. User clicks on a payment row to view detailed information
4. From the details page, user can refresh payment status if it's pending
5. User can navigate to related entities or back to the payment list

## Future Enhancements

1. **Payment Analytics**: Add charts and graphs to visualize payment trends
2. **Export Functionality**: Allow exporting payment data to CSV or PDF
3. **Payment Notifications**: Send notifications for payment status changes
4. **Manual Payment Processing**: Allow admins to manually mark payments as complete or failed
5. **Payment Refund Workflow**: Add functionality to process refunds for completed payments

## Usage

Navigate to `/payments` to view the payment list. Click on any payment to see its details at `/payments/[id]`. 