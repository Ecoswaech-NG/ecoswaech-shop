const CarMakes = [
    {
        id:1,
        name:'Audi',
    },
    {
        id:2,
        name:'BMW',
    },
    {
        id:3,
        name:'Mercedes-Benz',
        model: ['A-Class', 'C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE', 'GLS']
    },
    {
        id:4,
        name:'Toyota',
        model: ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Prius', 'Land Cruiser', 'BZ4X', 'BZ6X']
    },
    {
        id:5,
        name:'Honda',
    },
    {
        id:6,
        name:'Ford',
    },
    {
        id:7,
        name:'Chevrolet',
    },
    {
        id:8,
        name:'Nissan',
    },
    {
        id:9,
        name:'Volkswagen',
    },
    {
        id:10,
        name:'Hyundai',
    }
];

const Pricing = [
    { id: 1, amount: '0-5000' },
    { id: 2, amount: '5001-10000' },
    { id: 3, amount: '10001-20000' },
    { id: 4, amount: '20001-50000' },
    { id: 5, amount: '50001-100000' },
    { id: 6, amount: '100001+' }
];

const Category = [
    {
        id: 1,
        name: 'Cars',
        icon: 'https://cdn-icons-png.flaticon.com/128/3202/3202003.png'
    },
    {
        id: 2,
        name: 'SUVs',
        icon: 'https://cdn-icons-png.flaticon.com/128/13584/13584003.png'
    },
    {
        id: 3,
        name: 'Bikes',
        icon: 'https://cdn-icons-png.flaticon.com/128/2972/2972185.png'
    },
    {
        id: 4,
        name: 'Scooters',
        icon: 'https://cdn-icons-png.flaticon.com/128/3364/3364245.png'
    },
    {
        id: 5,
        name: 'Vans',
        icon: 'https://cdn-icons-png.flaticon.com/128/1433/1433678.png'
    },
    {
        id: 6,
        name: 'Trucks',
        icon: 'https://cdn-icons-png.flaticon.com/128/5814/5814855.png'
    },
    {
        id: 7,
        name: 'Buses',
        icon: 'https://cdn-icons-png.flaticon.com/128/3063/3063822.png'
    },
    {
        id: 8,
        name: 'Keystones', // For heavy machinery/tractors
        icon: 'https://cdn-icons-png.flaticon.com/128/2555/2555013.png'
    },
    {
        id: 9,
        name: 'Logistics', // For delivery bots/cargo
        icon: 'https://cdn-icons-png.flaticon.com/128/2830/2830305.png'
    }
];

const Location = [
    { id: 1, name: 'Lagos' },
    { id: 2, name: 'Abuja' },
    { id: 3, name: 'Port Harcourt' },
    { id: 4, name: 'Oyo' },
    { id: 5, name: 'Benin ' },
    { id: 6, name: 'Enugu' },
];

// Add Chargers and Accessories sections
const Chargers = [
  {
    id: 1,
    brand: 'Tesla',
    model: 'Wall Connector',
    type: 'Home Charger', // NEW FIELD
    price: 150000,
    power: '7kW',
    description: 'Fast home charging for all Tesla models.',
    images: [{ url: '' }],
    owner: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '08012345678'
    }
  },
  {
    id: 2,
    brand: 'ABB',
    model: 'Terra DC',
    type: 'DC Station', // NEW FIELD
    price: 1200000,
    power: '50kW',
    description: 'Commercial DC fast charging station.',
    images: [{ url: '' }],
    owner: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '08087654321'
    }
  },
  {
    id: 3,
    brand: 'Siemens',
    model: 'VersiCharge',
    type: 'AC Station', // NEW FIELD
    price: 400000,
    power: '22kW',
    description: 'Public AC charging station.',
    images: [{ url: '' }],
    owner: {
      name: 'Alex Green',
      email: 'alex@example.com',
      phone: '08011223344'
    }
  },
  // ...more chargers
];

const Accessories = [
    {
        id: 1,
        name: 'EV Floor Mats',
        price: 20000,
        compatibleWith: ['Tesla', 'Nissan'],
        images: [{ url: '' }]
    },
    {
        id: 2,
        name: 'Charging Cable',
        price: 15000,
        compatibleWith: ['BMW', 'Audi', 'Mercedes-Benz'],
        images: [{ url: '' }]
    },
    // ...add more accessories as needed
];

const Year = [
    { id: 1, name: '2026' },
    { id: 2, name: '2025' },
    { id: 3, name: '2024' },
    { id: 4, name: '2023' },
    { id: 5, name: '2022' },
    { id: 6, name: '2021' },
    { id: 7, name: '2020' },
    { id: 8, name: '2019' },
    { id: 9, name: '2018' },
    { id: 10, name: '2017' },
    { id: 11, name: '2016' },
    { id: 12, name: '2015' },
    { id: 13, name: '2014' },
    { id: 14, name: '2013' },
    { id: 15, name: '2012' },
];

export default {
    CarMakes,
    Pricing,
    Category,
    Location,
    Year,
    Chargers,
    Accessories,
};