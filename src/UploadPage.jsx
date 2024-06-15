import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './upload.css';

const SPREADSHEET_ID = '14FunmagQ2iJrr0gUwwIJiA2hj4FCuzhiTUG1V9GsAQk'; // Replace with your Google Sheet ID

const UploadPage = () => {
  const [uploadData, setUploadData] = useState({
    invoiceNumber: '',
    date: '',
    ewayBillNumber: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    destination: '',
    partyGstin: '',
    rows: [{ srNo: '', items: '', quantity: '', ratePerPiece: '' }],
    hsn: ''
  });

  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    // Function to parse URL parameters
    const getAccessTokenFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      return params.get('access_token');
    };

    // Get access token from URL
    const token = getAccessTokenFromUrl();

    // Set access token in state
    if (token) {
      setAccessToken(token);
    }
  }, []);

  const [selectedCustomer, setSelectedCustomer] = useState('');

  const handleDownload = () => {
    const url = `https://spreadsheets.google.com/feeds/download/spreadsheets/Export?key=${SPREADSHEET_ID}&exportFormat=pdf&pli=1`;
    window.open(url, '_blank');  
  };

  const customers = [
    {
      id: 1,
      name: 'Soni Steel',
      addressLine1: 'SONI STEEL & APPLIANCES PVT.LTD',
      addressLine2: 'Unit-3,plot no 35/36,golden ind estate',
      addressLine3: 'SOMNATH ROAD,DAMAN,396215',
      destination: 'Daman',
      gstin: '26AAHCS9715Q1ZI',
      hsn: '8509'
    },
    {
      id: 2,
      name: 'Customer B',
      addressLine1: '456 Elm St',
      addressLine2: 'Suite 101',
      addressLine3: 'Village',
      destination: 'Town',
      gstin: 'GSTIN456',
      hsn: 'HSN789'
    },
  ];

  const handleCustomerSelect = (e) => {
    const customerId = e.target.value;
    const customer = customers.find(cust => cust.id.toString() === customerId); // Ensure to compare with string type
    if (customer) {
      setSelectedCustomer(customer.name);
      setUploadData({
        ...uploadData,
        addressLine1: customer.addressLine1 || '',
        addressLine2: customer.addressLine2 || '',
        addressLine3: customer.addressLine3 || '',
        destination: customer.destination || '',
        partyGstin: customer.gstin || '',
        hsn: customer.hsn || ''
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUploadData({ ...uploadData, [name]: value });
  };

  const handleRowChange = (index, e) => {
    const { name, value } = e.target;
    const rows = [...uploadData.rows];
    rows[index] = { ...rows[index], [name]: value };
    setUploadData({ ...uploadData, rows });
  };

  const handleAddRow = () => {
    setUploadData({
      ...uploadData,
      rows: [...uploadData.rows, { srNo: '', items: '', quantity: '', ratePerPiece: '' }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      const updates = [
        { range: 'Sheet1!B5', values: [[uploadData.invoiceNumber]] },
        { range: 'Sheet1!E5', values: [[uploadData.date]] },
        { range: 'Sheet1!B6', values: [[uploadData.ewayBillNumber]] },
        { range: 'Sheet1!B8', values: [[uploadData.addressLine1]] },
        { range: 'Sheet1!B9', values: [[uploadData.addressLine2]] },
        { range: 'Sheet1!B10', values: [[uploadData.addressLine3]] },
        { range: 'Sheet1!E10', values: [[uploadData.destination]] },
        { range: 'Sheet1!B12', values: [[uploadData.partyGstin]] }
      ];

      uploadData.rows.forEach((row, index) => {
        updates.push(
          { range: `Sheet1!A${16 + index}`, values: [[row.srNo]] },
          { range: `Sheet1!B${16 + index}`, values: [[row.items]] },
          { range: `Sheet1!C${16 + index}`, values: [[row.quantity]] },
          { range: `Sheet1!D${16 + index}`, values: [[row.ratePerPiece]] }
        );
      });

      updates.push({ range: 'Sheet1!B33', values: [[uploadData.hsn]] });

      const body = {
        data: updates.filter(update => update.values[0][0] !== ''),
        valueInputOption: 'USER_ENTERED'
      };

      await axios.post(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchUpdate`,
        body,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      alert('Sheet updated successfully!');
    } catch (error) {
      console.error('Error updating sheet:', error);
      alert('Error updating sheet');
    }
  };

  const downloadFromGoogleSheets = async () => {
    try {

      const response = await axios.get(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Sheet1`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }
  );

  const rows = response.data.values.slice(4, 36); // Adjust based on your sheet structure
  const excelData = rows.map(row => ({
    srNo: row[0] || '',
    items: row[1] || '',
    quantity: row[2] || '',
    ratePerPiece: row[3] || ''
  }));

  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

  // Generate a unique file name
  const fileName = `downloaded_sheet_${new Date().getTime()}.xlsx`;

  // Save file using FileSaver.js
  XLSX.writeFile(wb, fileName);
} catch (error) {
  console.error('Error downloading sheet:', error);
  alert('Error downloading sheet');
}
};
  return (
    <div className="container">
      <h2>Upload Page</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Select Customer:</label>
          <select value={selectedCustomer} className='dropdown' onChange={handleCustomerSelect}>
            <option value="">Select Customer</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>{customer.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Invoice Number:</label>
          <input type="text" name="invoiceNumber" value={uploadData.invoiceNumber} onChange={handleInputChange} placeholder="Invoice Number" required />
        </div>
        <div>
          <label>Date:</label>
          <input type="date" name="date" value={uploadData.date} onChange={handleInputChange} placeholder="Date" required />
        </div>
        <div>
          <label>Eway Bill Number:</label>
          <input type="text" name="ewayBillNumber" value={uploadData.ewayBillNumber} onChange={handleInputChange} placeholder="Eway Bill Number" />
        </div>
        <div>
          <label>Address Line 1:</label>
          <input type="text" name="addressLine1" value={uploadData.addressLine1} onChange={handleInputChange} placeholder="Address Line 1" />
        </div>
        <div>
          <label>Address Line 2:</label>
          <input type="text" name="addressLine2" value={uploadData.addressLine2} onChange={handleInputChange} placeholder="Address Line 2" />
        </div>
        <div>
          <label>Address Line 3:</label>
          <input type="text" name="addressLine3" value={uploadData.addressLine3} onChange={handleInputChange} placeholder="Address Line 3" />
        </div>
        <div>
          <label>Destination:</label>
          <input type="text" name="destination" value={uploadData.destination} onChange={handleInputChange} placeholder="Destination" />
        </div>
        <div>
          <label>Party GSTIN:</label>
          <input type="text" name="partyGstin" value={uploadData.partyGstin} onChange={handleInputChange} placeholder="Party GSTIN" />
        </div>
        {uploadData.rows.map((row, index) => (
          <div key={index}>
            <label>Sr No:</label>
            <input type="text" name="srNo" value={row.srNo} onChange={(e) => handleRowChange(index, e)} placeholder="Sr No" />
            <label>Items:</label>
            <input type="text" name="items" value={row.items} onChange={(e) => handleRowChange(index, e)} placeholder="Items" />
            <label>Quantity:</label>
            <input type="text" name="quantity" value={row.quantity} onChange={(e) => handleRowChange(index, e)} placeholder="Quantity" />
            <label>Rate per Piece:</label>
            <input type="text" name="ratePerPiece" value={row.ratePerPiece} onChange={(e) => handleRowChange(index, e)} placeholder="Rate per Piece" />
          </div>
        ))}
        <button type="button" onClick={handleAddRow}>Add Row</button>
        <button type="submit">Submit</button>
        <button type="button" onClick={handleDownload}>Download PDF</button>
      </form>
    </div>
  );
};

export default UploadPage;
