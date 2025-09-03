import React, { useState, useEffect, useRef } from "react";
import Nav from "../components/Chat/Nav";
import { useProfile } from "../context/profileContext";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, TimeScale, PointElement, LineElement } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { FaDownload, FaChartBar, FaUserTie, FaClipboardList, FaMoneyBillWave, FaCalendarAlt, FaUsers, FaBriefcase, FaStore } from 'react-icons/fa';
import html2canvas from 'html2canvas';
import 'chartjs-adapter-date-fns';
import ProfileMenu from "../components/ProfileMenu"; // Add this import

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  TimeScale, 
  PointElement, 
  LineElement
);

const ReportingPage = () => {
  const { userDetails } = useProfile();
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [clients, setClients] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [services, setServices] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("today");
  
  // Chart refs for PDF export
  const revenueChartRef = useRef(null);
  const profitChartRef = useRef(null);
  const clientsChartRef = useRef(null);
  const expensesChartRef = useRef(null);
  const vendorsChartRef = useRef(null);
  const servicesChartRef = useRef(null);

  // Fetch all data when component mounts
  useEffect(() => {
    fetchAllData();
  }, [timeFilter]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchSales(),
        fetchExpenses(),
        fetchClients(),
        fetchVendors(),
        fetchServices(),
        fetchEmployees()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load some data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSales = async () => {
    try {
      const response = await axios.get("/api/sales", { params: { period: timeFilter } });
      setSales(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching sales:", error);
      setSales([]);
    }
  };

  const fetchExpenses = async () => {
    try {
      console.log("🔄 Fetching expenses for period:", timeFilter);
      
      // Temporary state to track API call steps
      let debugStep = "Starting fetch";
      
      // EXACTLY match how the ExpensesPage component fetches expenses
      const url = "/api/expenses/all";
      
      const params = {};
      if (timeFilter !== "all") {
        params.period = timeFilter;
      }
      
      debugStep = "Making API call";
      console.log("Making request to:", url, "with params:", params);
      
      const response = await axios.get(url, { params });
      
      debugStep = "Processing response";
      console.log("Raw API response:", response);
      
      // Check if we got a valid response
      if (!response || !response.data) {
        console.error("Invalid response:", response);
        setExpenses([]);
        return;
      }
      
      // Force response data to be treated as an array
      const expensesData = Array.isArray(response.data) ? response.data : [];
      
      console.log(`✅ Successfully loaded ${expensesData.length} expenses`);
      if (expensesData.length > 0) {
        console.log("Sample expense:", expensesData[0]);
      }
      
      // Set the state with the expenses data
      setExpenses(expensesData);
      
      // Calculate total for verification
      const total = expensesData.reduce((sum, exp) => 
        sum + parseFloat(exp.amount || 0), 0);
        
      console.log(`📊 Total expenses amount: $${total.toFixed(2)}`);
      
      // If no expenses were found but the API call succeeded
      if (expensesData.length === 0) {
        console.log("No expenses found for the selected time period");
      }
    } catch (error) {
      console.error("❌ Error fetching expenses:", error);
      
      // Log detailed error information
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      } else if (error.request) {
        console.error("Error request:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      
      setExpenses([]);
      toast.error("Failed to load expenses data");
    }
  };

  const fetchClients = async () => {
    try {
      const response = await axios.get("/api/clients/all");
      setClients(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching clients:", error);
      setClients([]);
    }
  };

  const fetchVendors = async () => {
    try {
      const response = await axios.get("/api/vendors/all");
      setVendors(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      setVendors([]);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get("/api/services/all");
      setServices(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching services:", error);
      setServices([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axios.get("/api/employees/all");
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    }
  };

  // Add this helper function before the calculateMetrics function
const getTimeFilterStartDate = (filter) => {
  const now = new Date();
  
  switch (filter) {
    case 'today':
      return new Date(now.setHours(0, 0, 0, 0));
    case 'week':
      const firstDayOfWeek = new Date(now);
      firstDayOfWeek.setDate(now.getDate() - now.getDay());
      firstDayOfWeek.setHours(0, 0, 0, 0);
      return firstDayOfWeek;
    case 'month':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'quarter':
      const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
      return new Date(now.getFullYear(), quarterMonth, 1);
    case 'year':
      return new Date(now.getFullYear(), 0, 1);
    default:
      return null;
  }
};

// Update the calculateMetrics function to include all expense sources
const calculateMetrics = () => {
  // Filter data based on timeFilter
  const startDate = getTimeFilterStartDate(timeFilter);
  
  // Filter sales by time period
  const filteredSales = startDate 
    ? sales.filter(sale => new Date(sale.saleDate || sale.createdAt) >= startDate)
    : sales;
  
  // Filter expenses by time period
  const filteredExpenses = startDate
    ? expenses.filter(expense => new Date(expense.date) >= startDate)
    : expenses;
    
  // Filter vendor payments by time period
  const filteredVendorPayments = startDate && vendors 
    ? vendors.reduce((payments, vendor) => {
        if (vendor.payments) {
          const filteredPayments = vendor.payments.filter(payment => 
            new Date(payment.date) >= startDate
          );
          return [...payments, ...filteredPayments];
        }
        return payments;
      }, [])
    : [];
    
  // Get all employee payments for the period
  const filteredEmployeePayments = startDate && employees
    ? employees.reduce((payments, employee) => {
        if (employee.payments) {
          const filteredPayments = employee.payments.filter(payment => 
            new Date(payment.date) >= startDate
          );
          return [...payments, ...filteredPayments];
        }
        return payments;
      }, [])
    : [];
  
  // Calculate total revenue from sales
  const totalRevenue = filteredSales.reduce((sum, sale) => 
    sum + (parseFloat(sale.price) || 0), 0);
  
  // Calculate total regular expenses
  const regularExpenses = filteredExpenses.reduce((sum, expense) => 
    sum + (parseFloat(expense.amount) || 0), 0);
  
  // Calculate vendor expenses (both subscriptions and one-time payments)
  const vendorSubscriptionExpenses = vendors
    .filter(v => v.status === 'Active' && v.vendor_type === 'Subscription')
    .reduce((sum, vendor) => sum + (parseFloat(vendor.subscription_amount) || 0), 0);
    
  const vendorOneTimeExpenses = filteredVendorPayments.reduce((sum, payment) => 
    sum + (parseFloat(payment.amount) || 0), 0);
  
  // Calculate employee salary expenses
  const employeeSalaryExpenses = filteredEmployeePayments.reduce((sum, payment) => 
    sum + (parseFloat(payment.amount) || 0), 0);
  
  // Calculate total expenses from all sources
  const totalExpenses = regularExpenses + vendorSubscriptionExpenses + 
    vendorOneTimeExpenses + employeeSalaryExpenses;
  
  // Calculate profit or loss (can be negative)
  const profitLoss = totalRevenue - totalExpenses;
  
  // Calculate client statistics
  const clientStatusCounts = clients.reduce((counts, client) => {
    const status = client.status || 'Unknown';
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});
  
  const totalClients = clients.length;
  const activeClients = clients.filter(client => client.status === 'Active Client').length;
  
  // Calculate vendor statistics
  const totalVendors = vendors.length;
  const activeVendors = vendors.filter(vendor => vendor.status === 'Active').length;
  
  // Calculate service statistics
  const servicesByStatus = services.reduce((counts, service) => {
    const status = service.status || 'Unknown';
    counts[status] = (counts[status] || 0) + 1;
    return counts;
  }, {});
  
  const totalServices = services.length;
  
  // Calculate employee statistics
  const totalEmployees = employees.length;
  const totalSalaries = employees
    .filter(employee => employee.status === 'Active')
    .reduce((sum, employee) => sum + (parseFloat(employee.salary) || 0), 0);
  
  // Calculate one-time vs subscription revenue
  const oneTimeRevenue = filteredSales
    .filter(sale => !sale.isSubscription)
    .reduce((sum, sale) => sum + (parseFloat(sale.price) || 0), 0);
    
  const subscriptionRevenue = filteredSales
    .filter(sale => sale.isSubscription)
    .reduce((sum, sale) => sum + (parseFloat(sale.price) || 0), 0);
  
  return {
    totalRevenue,
    totalExpenses,
    profitLoss,
    clientStatusCounts,
    totalClients,
    activeClients,
    totalVendors,
    activeVendors,
    servicesByStatus,
    totalServices,
    totalEmployees,
    totalSalaries,
    oneTimeRevenue,
    subscriptionRevenue
  };
};
  
  // Helper function to get service name
  const getServiceName = (serviceId) => {
    const service = services.find(s => s._id === serviceId);
    return service ? service.name : "Unknown Service";
  };
  
  // Time filtering label
  const getTimeFilterLabel = () => {
    switch(timeFilter) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'quarter': return 'This Quarter';
      case 'year': return 'This Year';
      default: return 'All Time';
    }
  };
  
  // Prepare chart data for revenue vs expenses
  const prepareFinancialChart = () => {
    const metrics = calculateMetrics();
    
    return {
      labels: ['Revenue', 'Expenses', 'Profit'],
      datasets: [
        {
          label: `Financial Overview (${getTimeFilterLabel()})`,
          data: [metrics.totalRevenue, metrics.totalExpenses, metrics.profitLoss],
          backgroundColor: [
            'rgba(75, 192, 92, 0.6)', // Revenue (green)
            'rgba(255, 99, 132, 0.6)', // Expenses (red)
            'rgba(54, 162, 235, 0.6)', // Profit (blue)
          ],
          borderColor: [
            'rgba(75, 192, 92, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  // Prepare chart data for revenue breakdown
  const prepareRevenueBreakdownChart = () => {
    const metrics = calculateMetrics();
    
    return {
      labels: ['One-time Sales', 'Subscription Revenue'],
      datasets: [
        {
          label: 'Revenue Breakdown',
          data: [metrics.oneTimeRevenue, metrics.subscriptionRevenue],
          backgroundColor: [
            'rgba(255, 159, 64, 0.6)', // One-time (orange)
            'rgba(153, 102, 255, 0.6)', // Subscription (purple)
          ],
          borderColor: [
            'rgba(255, 159, 64, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1
        }
      ]
    };
  };
  
  // Prepare chart data for clients by status
  const prepareClientStatusChart = () => {
    const metrics = calculateMetrics();
    const statuses = Object.keys(metrics.clientStatusCounts);
    const counts = statuses.map(status => metrics.clientStatusCounts[status]);
    
    // Color mapping for different statuses
    const statusColors = {
      "Prospect": ['rgba(54, 162, 235, 0.6)', 'rgba(54, 162, 235, 1)'],
      "Lead": ['rgba(255, 159, 64, 0.6)', 'rgba(255, 159, 64, 1)'],
      "Active Client": ['rgba(75, 192, 92, 0.6)', 'rgba(75, 192, 92, 1)'],
      "Inactive": ['rgba(201, 203, 207, 0.6)', 'rgba(201, 203, 207, 1)'],
      "On Hold": ['rgba(255, 205, 86, 0.6)', 'rgba(255, 205, 86, 1)'],
      "Former Client": ['rgba(255, 99, 132, 0.6)', 'rgba(255, 99, 132, 1)']
    };
    
    const backgroundColors = statuses.map(status => 
      statusColors[status] ? statusColors[status][0] : 'rgba(201, 203, 207, 0.6)'
    );
    
    const borderColors = statuses.map(status => 
      statusColors[status] ? statusColors[status][1] : 'rgba(201, 203, 207, 1)'
    );
    
    return {
      labels: statuses,
      datasets: [
        {
          label: 'Clients by Status',
          data: counts,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1
        }
      ]
    };
  };
  
  // Replace your prepareExpenseCategoryChart function with this:

const prepareExpenseCategoryChart = () => {
  // First check if expenses array is empty
  if (expenses.length === 0) {
    console.log("No expenses data available for chart");
    return {
      labels: ['No expense data'],
      datasets: [
        {
          label: 'Expenses by Category',
          data: [1],
          backgroundColor: ['rgba(200, 200, 200, 0.6)'],
          borderWidth: 1
        }
      ]
    };
  }
  
  // If we have expenses, process them
  const metrics = calculateMetrics();
  const categories = Object.keys(metrics.expensesByCategory || {});
  
  console.log("Expense categories found:", categories);
  
  // If no categories (should not happen if expenses exist, but just in case)
  if (categories.length === 0) {
    return {
      labels: ['Uncategorized'],
      datasets: [
        {
          label: 'Expenses by Category',
          data: [expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0)],
          backgroundColor: ['rgba(255, 99, 132, 0.6)'],
          borderWidth: 1
        }
      ]
    };
  }
  
  // Get the amounts for each category
  const amounts = categories.map(category => metrics.expensesByCategory[category]);
  
  // Define color palette for expense categories
  const backgroundColors = [
    'rgba(255, 99, 132, 0.6)',
    'rgba(54, 162, 235, 0.6)',
    'rgba(255, 206, 86, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)',
    'rgba(199, 199, 199, 0.6)',
    'rgba(83, 102, 255, 0.6)',
    'rgba(78, 205, 196, 0.6)',
  ];
  
  return {
    labels: categories,
    datasets: [
      {
        label: 'Expenses by Category',
        data: amounts,
        backgroundColor: backgroundColors.slice(0, categories.length),
        borderWidth: 1
      }
    ]
  };
};
  
  // Prepare chart data for services by status
  const prepareServiceStatusChart = () => {
    const metrics = calculateMetrics();
    const statuses = Object.keys(metrics.servicesByStatus);
    const counts = statuses.map(status => metrics.servicesByStatus[status]);
    
    // Color mapping for different statuses
    const statusColors = {
      "Active": ['rgba(75, 192, 92, 0.6)', 'rgba(75, 192, 92, 1)'],
      "Inactive": ['rgba(201, 203, 207, 0.6)', 'rgba(201, 203, 207, 1)'],
      "Coming Soon": ['rgba(54, 162, 235, 0.6)', 'rgba(54, 162, 235, 1)'],
      "Discontinued": ['rgba(255, 99, 132, 0.6)', 'rgba(255, 99, 132, 1)']
    };
    
    const backgroundColors = statuses.map(status => 
      statusColors[status] ? statusColors[status][0] : 'rgba(201, 203, 207, 0.6)'
    );
    
    const borderColors = statuses.map(status => 
      statusColors[status] ? statusColors[status][1] : 'rgba(201, 203, 207, 1)'
    );
    
    return {
      labels: statuses,
      datasets: [
        {
          label: 'Services by Status',
          data: counts,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1
        }
      ]
    };
  };
  
  // Fix the prepareTopServicesChart function to handle null/undefined values
const prepareTopServicesChart = () => {
  // Check if sales array exists and has items
  if (!Array.isArray(sales) || sales.length === 0) {
    console.log("No sales data available for top services chart");
    // Return default empty chart data
    return {
      labels: [],
      datasets: [{
        label: 'No Data Available',
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1
      }]
    };
  }

  // Group sales by service and calculate total revenue
  const serviceRevenue = {};
  
  sales.forEach(sale => {
    if (!sale.serviceId) return;
    
    const serviceId = typeof sale.serviceId === 'object' ? 
      (sale.serviceId._id || sale.serviceId) : sale.serviceId;
    
    if (!serviceId) return;
    
    const serviceName = getServiceName(serviceId);
    const amount = parseFloat(sale.price) || 0;
    
    if (!serviceRevenue[serviceName]) {
      serviceRevenue[serviceName] = 0;
    }
    
    serviceRevenue[serviceName] += amount;
  });
  
  // Sort services by revenue and take top 5
  const sortedServices = Object.entries(serviceRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  const labels = sortedServices.map(([name]) => name);
  const data = sortedServices.map(([_, revenue]) => revenue);
  
  // Generate colors
  const backgroundColors = [
    'rgba(54, 162, 235, 0.6)',
    'rgba(75, 192, 192, 0.6)',
    'rgba(153, 102, 255, 0.6)',
    'rgba(255, 159, 64, 0.6)',
    'rgba(255, 99, 132, 0.6)'
  ];
  
  const borderColors = backgroundColors.map(color => 
    color.replace('0.6', '1')
  );
  
  return {
    labels,
    datasets: [{
      label: 'Revenue by Service',
      data,
      backgroundColor: backgroundColors.slice(0, data.length),
      borderColor: borderColors.slice(0, data.length),
      borderWidth: 1
    }]
  };
};

  // Download comprehensive report
  const handleDownloadReport = async () => {
    try {
      toast.loading("Generating comprehensive report...");
      
      // Capture chart images
      const charts = [
        { ref: revenueChartRef, name: "Financial Overview" },
        { ref: profitChartRef, name: "Revenue Breakdown" },
        { ref: clientsChartRef, name: "Client Status" },
        { ref: expensesChartRef, name: "Expenses by Category" },
        { ref: servicesChartRef, name: "Services Status" },
        { ref: vendorsChartRef, name: "Top Services" }
      ];
      
      const chartImages = [];
      
      for (const chart of charts) {
        if (chart.ref.current) {
          const canvas = await html2canvas(chart.ref.current);
          chartImages.push({
            name: chart.name,
            image: canvas.toDataURL('image/png')
          });
        }
      }
      
      // Create PDF report
      const pdfDoc = await PDFDocument.create();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      
      // Cover page
      const coverPage = pdfDoc.addPage([612, 792]);
      const { width, height } = coverPage.getSize();
      
      // Cover styling
      coverPage.drawRectangle({
        x: 0,
        y: 0,
        width,
        height,
        color: rgb(0.95, 0.95, 0.95),
      });
      
      // Title
      coverPage.drawText("Business Performance Report", {
        x: 50,
        y: height - 150,
        size: 30,
        font: helveticaBold,
        color: rgb(0, 0.33, 0.64),
      });
      
      // Company name
      coverPage.drawText(`${userDetails?.companyName || "Your Agency"}`, {
        x: 50,
        y: height - 200,
        size: 24,
        font: helveticaBold,
        color: rgb(0.2, 0.2, 0.2),
      });
      
      // Time period
      coverPage.drawText(`Reporting Period: ${getTimeFilterLabel()}`, {
        x: 50,
        y: height - 240,
        size: 16,
        font: helveticaFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      // Date generated
      coverPage.drawText(`Generated on: ${new Date().toLocaleDateString()}`, {
        x: 50,
        y: height - 270,
        size: 12,
        font: helveticaFont,
        color: rgb(0.3, 0.3, 0.3),
      });
      
      // Add key metrics page
      const metricsPage = pdfDoc.addPage([612, 792]);
      
      // Page header
      metricsPage.drawRectangle({
        x: 0,
        y: height - 50,
        width,
        height: 50,
        color: rgb(0, 0.33, 0.64),
      });
      
      metricsPage.drawText("Key Business Metrics", {
        x: 50,
        y: height - 30,
        size: 20,
        font: helveticaBold,
        color: rgb(1, 1, 1),
      });
      
      // Add metrics
      const metrics = calculateMetrics();
      let yPos = height - 80;
      
      // Financial summary
      metricsPage.drawText("Financial Summary", {
        x: 50,
        y: yPos,
        size: 16,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });
      
      yPos -= 30;
      metricsPage.drawText(`Total Revenue: $${metrics.totalRevenue.toFixed(2)}`, {
        x: 70,
        y: yPos,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      yPos -= 20;
      metricsPage.drawText(`Total Expenses: $${metrics.totalExpenses.toFixed(2)}`, {
        x: 70,
        y: yPos,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      yPos -= 20;
      metricsPage.drawText(`Profit: $${metrics.profitLoss.toFixed(2)}`, {
        x: 70,
        y: yPos,
        size: 12,
        font: helveticaBold,
        color: metrics.profitLoss >= 0 ? rgb(0, 0.5, 0) : rgb(0.8, 0, 0),
      });
      
      // Client summary
      yPos -= 40;
      metricsPage.drawText("Client Summary", {
        x: 50,
        y: yPos,
        size: 16,
        font: helveticaBold,
        color: rgb(0, 0, 0),
      });
      
      yPos -= 30;
      metricsPage.drawText(`Total Clients: ${metrics.totalClients}`, {
        x: 70,
        y: yPos,
        size: 12,
        font: helveticaFont,
        color: rgb(0, 0, 0),
      });
      
      Object.entries(metrics.clientStatusCounts).forEach(([status, count]) => {
        yPos -= 20;
        metricsPage.drawText(`${status}: ${count}`, {
          x: 90,
          y: yPos,
          size: 12,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });
      });
      
      // For each chart image, add a new page
      for (const chartData of chartImages) {
        const chartPage = pdfDoc.addPage([612, 792]);
        
        // Page header
        chartPage.drawRectangle({
          x: 0,
          y: height - 50,
          width,
          height: 50,
          color: rgb(0, 0.33, 0.64),
        });
        
        chartPage.drawText(chartData.name, {
          x: 50,
          y: height - 30,
          size: 20,
          font: helveticaBold,
          color: rgb(1, 1, 1),
        });
        
        // Embed and draw the chart image
        const pngImage = await pdfDoc.embedPng(chartData.image);
        
        const scale = 0.75; // Scale down to fit on page
        const imgWidth = pngImage.width * scale;
        const imgHeight = pngImage.height * scale;
        
        chartPage.drawImage(pngImage, {
          x: (width - imgWidth) / 2,
          y: height - 100 - imgHeight,
          width: imgWidth,
          height: imgHeight,
        });
      }
      
      // Save the PDF
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, `business_report_${timeFilter}_${new Date().toISOString().slice(0,10)}.pdf`);
      
      toast.dismiss();
      toast.success("Report generated successfully!");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.dismiss();
      toast.error("Failed to generate report");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen">
        <Nav />
        <div className="flex-1 p-8 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  // Calculate all metrics
  const metrics = calculateMetrics();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Nav />
      <div className="flex-1 p-6 overflow-auto relative"> {/* Add relative positioning */}
        {/* Add ProfileMenu in absolute position */}
        <div className="absolute top-4 right-4 z-10">
          <ProfileMenu />
        </div>
        
        {/* Wrap content in div with margin-top to prevent overlap */}
        <div className="mt-14">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Business Analytics Dashboard</h1>
            
            <div className="flex space-x-2">
              {/* Time Filter Buttons */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 inline-flex">

                <button 
                  onClick={() => setTimeFilter('today')}
                  className={`px-3 py-1 text-sm rounded-l-lg ${timeFilter === 'today' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                >
                  Today
                </button>
                <button 
                  onClick={() => setTimeFilter('week')}
                  className={`px-3 py-1 text-sm ${timeFilter === 'week' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                >
                  This Week
                </button>
                <button 
                  onClick={() => setTimeFilter('month')}
                  className={`px-3 py-1 text-sm ${timeFilter === 'month' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                >
                  This Month
                </button>
                <button 
                  onClick={() => setTimeFilter('quarter')}
                  className={`px-3 py-1 text-sm ${timeFilter === 'quarter' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                >
                  This Quarter
                </button>
                <button 
                  onClick={() => setTimeFilter('year')}
                  className={`px-3 py-1 text-sm ${timeFilter === 'year' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                >
                  This Year
                </button>

                <button 
                  onClick={() => setTimeFilter('all')}
                  className={`px-3 py-1 text-sm rounded-r-lg ${timeFilter === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'}`}
                >
                  All Time
                </button>
              </div>
              
              {/* Download Report Button */}
              <button 
                onClick={handleDownloadReport}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <FaDownload className="mr-2" />
                Download Report
              </button>
            </div>
          </div>
          
          {/* Debug Information - Remove in production */}

          
          {/* Expense Troubleshooting Button */}

          
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <div className="p-3 rounded-full bg-green-100 mr-4">
                  <FaMoneyBillWave className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Total Revenue</h3>
                  <p className="text-3xl font-bold text-gray-800">${metrics.totalRevenue.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-1">{getTimeFilterLabel()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <div className="p-3 rounded-full bg-red-100 mr-4">
                  <FaClipboardList className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Total Expenses</h3>
                  <p className="text-3xl font-bold text-gray-800">${metrics.totalExpenses.toFixed(2)}</p>
                  <p className="text-sm text-gray-500 mt-1">{getTimeFilterLabel()}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <div className="p-3 rounded-full bg-blue-100 mr-4">
                  <FaChartBar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Profit/Loss</h3>
                  <p className={`text-3xl font-bold ${metrics.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${metrics.profitLoss.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{getTimeFilterLabel()}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Client and Resource Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <div className="p-3 rounded-full bg-purple-100 mr-4">
                  <FaUserTie className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Total Clients</h3>
                  <p className="text-3xl font-bold text-gray-800">{metrics.totalClients}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {metrics.clientStatusCounts['Active Client'] || 0} active
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <div className="p-3 rounded-full bg-yellow-100 mr-4">
                  <FaStore className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Vendors</h3>
                  <p className="text-3xl font-bold text-gray-800">{metrics.totalVendors}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {metrics.activeVendors} active vendors
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <div className="p-3 rounded-full bg-green-100 mr-4">
                  <FaBriefcase className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Services</h3>
                  <p className="text-3xl font-bold text-gray-800">{metrics.totalServices}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {metrics.servicesByStatus['Active'] || 0} active services
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-2">
                <div className="p-3 rounded-full bg-blue-100 mr-4">
                  <FaUsers className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Employees</h3>
                  <p className="text-3xl font-bold text-gray-800">{metrics.totalEmployees}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    ${metrics.totalSalaries.toFixed(2)} monthly
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Charts - First Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Financial Overview Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Financial Overview</h3>
              <div ref={revenueChartRef} className="h-80">
                <Bar 
                  data={prepareFinancialChart()} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }}
                />
              </div>
            </div>
            
            {/* Revenue Breakdown Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Revenue Breakdown</h3>
              <div ref={profitChartRef} className="h-80">
                <Pie 
                  data={prepareRevenueBreakdownChart()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Charts - Second Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Client Status Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Clients by Status</h3>
              <div ref={clientsChartRef} className="h-80">
                <Pie 
                  data={prepareClientStatusChart()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </div>
            </div>
            
            {/* Expenses by Category Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Expenses by Category</h3>
              <div ref={expensesChartRef} className="h-80">
                <Pie 
                  data={prepareExpenseCategoryChart()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Charts - Third Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Services Status Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Services by Status</h3>
              <div ref={servicesChartRef} className="h-80">
                <Pie 
                  data={prepareServiceStatusChart()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </div>
            </div>
            
            {/* Top Services by Revenue */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Top Services by Revenue</h3>
              <div ref={vendorsChartRef} className="h-80">
                <Bar 
                  data={prepareTopServicesChart()}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportingPage;