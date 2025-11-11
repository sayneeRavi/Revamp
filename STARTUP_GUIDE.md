# Revamp ERP - Service Startup Guide

## Prerequisites
- Node.js installed
- Maven installed
- Java 21 installed
- MongoDB Atlas accessible

## Service Ports
- **Gateway**: 4000
- **Auth Service**: 8081
- **Booking Service**: 8080
- **Frontend**: 3000

## Startup Instructions

### Option 1: Manual Startup (Recommended for Testing)

Open **4 separate terminal windows** and run each service:

#### Terminal 1: Gateway
```powershell
cd gateway
npm start
```
Expected output: `🚀 Gateway running on port 4000`

#### Terminal 2: Auth Service
```powershell
cd services/authservice
mvn spring-boot:run
```
Expected output: `Started AuthApplication in X seconds`

#### Terminal 3: Booking Service
```powershell
cd services/bookingservice
mvn spring-boot:run
```
Expected output: `Started BookingServiceApplication in X seconds`

#### Terminal 4: Frontend
```powershell
cd frontend
npm run dev
```
Expected output: `Ready on http://localhost:3000`

### Option 2: Using PowerShell Scripts

You can also create individual startup scripts for each service.

## Testing the Booking Flow

1. **Start all services** (Gateway, Auth Service, Booking Service, Frontend)

2. **Access Frontend**: Open http://localhost:3000

3. **Login/Register**: Use the auth service to create an account

4. **Test Service Booking**:
   - Click "Book Service" button
   - Select vehicle (or add new)
   - Select date
   - Choose time slot
   - Add remarks
   - Click "Proceed to Payment"
   - Choose payment method (Card or Cash)
   - Complete booking

5. **Test Modification Booking**:
   - Click "Book Modification" button
   - Select vehicle
   - Select date
   - Check modification services
   - Review estimated time/cost
   - Proceed to payment

## Environment Variables

### Frontend (.env.local)
Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_BASE=http://localhost:8080
NEXT_PUBLIC_TIMESLOT_API_BASE=http://localhost:8081
NEXT_PUBLIC_CUSTOMER_API_BASE=http://localhost:8082
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SQVBOA8STCoiSMhmtbVKCnnXArbkCmeQX6QH6649IZJrXl2HhriWUuTejYQPSIMMcayNnQd0nYekB8NynRvl3Ul00qlZ2TXZ0
```

### Booking Service
Already configured in `application.properties`:
- MongoDB URI: Set in application.properties
- Stripe Secret: Set in application.properties
- JWT Secret: Set in application.properties

## Troubleshooting

### Frontend npm install issues
If you get React 19 peer dependency warnings:
```powershell
cd frontend
npm install --legacy-peer-deps
```

### MongoDB Connection Issues
- Verify MongoDB Atlas connection string is correct
- Check network access in MongoDB Atlas dashboard
- Ensure IP whitelist includes your IP

### Port Already in Use
If a port is already in use:
- Change the port in the respective service's configuration
- Or stop the service using that port

### JWT Token Issues
- Ensure JWT secret matches between auth service and booking service
- Check token expiration time

## API Endpoints

### Booking Service
- `GET /api/modifications` - List modification services
- `POST /api/bookings/appointments` - Create appointment
- `POST /api/bookings/{bookingId}/payment-intent` - Create payment intent
- `POST /api/webhooks/stripe` - Stripe webhook handler

### Auth Service
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

## Next Steps

1. **Timeslot Service Integration**: Update `TimeslotClient.bookSlot()` URL when timeslot service is ready
2. **Customer Service Integration**: Wire vehicle creation/fetching from customer service
3. **Admin Features**: Add admin assignment endpoints
4. **Employee Features**: Add employee progress update endpoints

