CREATE DATABASE Restaurant_reservation_system;

USE Restaurant_reservation_system;

--admin
CREATE TABLE Admins
(
    AdminID INT IDENTITY(1,1) PRIMARY KEY,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL
);

INSERT INTO Admins
(Email,Password)
VALUES
('admin@gmail.com','Admin@123');

--customer
CREATE TABLE Customers
(
    CustomerID INT IDENTITY(1,1) PRIMARY KEY,
    FullName VARCHAR(100) NOT NULL,
    DOB DATE NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    Phone VARCHAR(15) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Address VARCHAR(250) NOT NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);


INSERT INTO Customers
(FullName,
DOB,
Email,
Phone,
Password,
Address
) 
VALUES
('Haripriya K',
'2026-06-26',
'haripriya@gmail.com',
'9087899087',
'Hari@123',
'125-Ram street, Coimbatore'),
('Devasree',
'2005-06-25',
'devasree@gmail.com',
'9089908900',
'Devasree@123',
'Visaka Nagar, Coimbatore'),
('Danusree',
'2005-05-26',
'danusree@gmail.com',
'7867989087',
'Danusree@123',
'Town Hall, Coimbatore'),
('Sindhuja',
'2006-06-17',
'sindhu@gmail.com',
'9087657890',
'Sindhuja@123',
'Mettupalayam, Coimbatore');



--tables
CREATE TABLE RestaurantTables
(
    TableID VARCHAR(10) PRIMARY KEY,
    Capacity INT NOT NULL,
    DiningArea VARCHAR(20) NOT NULL,
    TableType VARCHAR(20) NOT NULL,
    Price DECIMAL(10,2) NOT NULL,
    Status VARCHAR(20) DEFAULT 'Available',
    IsDeleted BIT DEFAULT 0
);


INSERT INTO RestaurantTables
VALUES
('C101',2,'Indoor','Couple',500,'Available',0),
('F101',6,'Indoor','Family',1000,'Available',0),
('F102',8,'Rooftop','Family',1000,'Available',1),
('F103',6,'Outdoor','Family',1000,'Not Available',0),
('V101',6,'Indoor','VIP',1500,'Available',0);

--reservations

CREATE TABLE Reservations
(
    ReservationID INT IDENTITY(1,1) PRIMARY KEY,
    CustomerID INT NOT NULL,
    TableID VARCHAR(10) NOT NULL,
    BookingDate DATE NOT NULL,
    Session VARCHAR(20) NOT NULL,
    TimeSlot VARCHAR(30) NOT NULL,
    GuestCount INT NOT NULL,
    BookingStatus VARCHAR(20) DEFAULT 'Booked',
    BookedAt DATETIME  DEFAULT GETDATE(),
    CancelledAt DATETIME NULL,
    FOREIGN KEY(CustomerID) REFERENCES Customers(CustomerID),
    FOREIGN KEY(TableID) REFERENCES RestaurantTables(TableID)
);

INSERT INTO Reservations
(
CustomerID,
TableID,
BookingDate,
Session,
TimeSlot,
GuestCount,
BookingStatus,
BookedAt
)
VALUES
(2,'F101',
'2026-06-27',
'Breakfast',
'8:00 AM - 9:00 AM',
5,
'Completed',
'2026-06-27 10:35'),

(2,'V101',
'2026-06-30',
'Lunch',
'1:00 PM - 2:00 PM',
5,
'Booked',
'2026-06-28 15:51'),

(4,'F101',
'2026-06-28',
'Dinner',
'9:00 PM - 10:00 PM',
6,
'Completed',
'2026-06-28 11:49');


SELECT * FROM Admins;
SELECT * FROM Customers;
SELECT * FROM RestaurantTables;
SELECT * FROM Reservations;


--INDEXES

--customer search NAME
CREATE INDEX Customers_Name_idx
ON Customers(FullName);

--EMAIL UNIQUE INDEX
CREATE UNIQUE INDEX Customers_Email_idx
ON Customers(Email);

--PHONE
CREATE INDEX Customers_Phone_idx
ON Customers(Phone);

--Tables
CREATE UNIQUE INDEX Tables_TableId_idx
ON RestaurantTables(TableId);

CREATE INDEX Tables_Status_idx
ON RestaurantTables(Status);

CREATE INDEX Tables_Type_idx
ON RestaurantTables(TableType);

--bookingdetails
CREATE INDEX Booking_Customer_idx
ON Reservations(CustomerId);

CREATE INDEX Booking_Date_idx
ON Reservations(BookingDate);

--Composite index with slot ,session and booking date
CREATE INDEX Booking_Search_idx
ON Reservations
(
BookingDate,
Session,
TimeSlot
);

--VIEWS

-- Display active records
CREATE VIEW ActiveTables_view
AS
SELECT *
FROM RestaurantTables
WHERE IsDeleted=0;

SELECT * FROM ActiveTables_view

-- Display inactive records
CREATE VIEW InActiveTables_view
AS
SELECT *
FROM RestaurantTables
WHERE IsDeleted=1;

SELECT * FROM InActiveTables_view


--VIEWS
CREATE VIEW ReservationDetails_VIEW
AS
SELECT
R.BookedAt,
C.FullName CustomerName,
C.Phone,
R.TableId,
R.Session,
R.TimeSlot,
R.GuestCount,
R.BookingStatus
FROM Reservations R
INNER JOIN Customers C
ON R.CustomerId=C.CustomerId;

Select * from ReservationDetails_VIEW;

--view for booking summary
CREATE VIEW BookingSummary_VIEW
AS
SELECT
BookingStatus,
COUNT(*) TotalBookings
FROM Reservations
GROUP BY BookingStatus;

SELECT * FROM BookingSummary_VIEW;

--status filter
SELECT *
FROM ReservationDetails_VIEW
WHERE BookingStatus='Booked';

--session filter
SELECT *
FROM ReservationDetails_VIEW
WHERE Session='Lunch';

--guest count ascending 
SELECT *
FROM ReservationDetails_VIEW
ORDER BY GuestCount;

----QUESTIONS ------

--1. Display all records
SELECT * FROM Customers;
SELECT * FROM RestaurantTables;
SELECT * FROM Reservations;

--2. Display active records
SELECT * FROM RestaurantTables
WHERE IsDeleted=0;

--3. Display inactive records
SELECT * FROM RestaurantTables WHERE IsDeleted=1;

--4. Search by name
SELECT * FROM Customers WHERE FullName LIKE '%Deva%';

--5. Count total records
--customers
SELECT COUNT(*) AS TotalCustomers
FROM Customers;

--tables count
SELECT COUNT(*) AS TotalTables
FROM RestaurantTables;

--Bookings count
SELECT COUNT(*) AS TotalBookings FROM Reservations;

--6. Count records by status
SELECT
BookingStatus,
COUNT(*) Total
FROM Reservations
GROUP BY BookingStatus;

--7. Display recently added records

--For customers
SELECT TOP 5 * FROM Customers ORDER BY CustomerId DESC;

--For Bookings
SELECT *
FROM Reservations
ORDER BY BookedAt DESC;

--8. Display records within date range
SELECT *
FROM Reservations
WHERE BookingDate
BETWEEN
'2026-06-27'
AND
'2026-06-30';

--9. Display top 5 records
SELECT TOP 5 *
FROM Reservations
ORDER BY BookedAt DESC;

--10. Display summary report

SELECT
BookingStatus,
COUNT(*) AS TotalBookings,
SUM(GuestCount) AS TotalGuests,
AVG(GuestCount) AS AverageGuests
FROM Reservations
GROUP BY BookingStatus;

