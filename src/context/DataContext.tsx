
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Client, Order, Expense, OrderStatus, PaymentStatus, ExpenseCategory } from '../types';

interface DataContextType {
  clients: Client[];
  orders: Order[];
  expenses: Expense[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  addOrder: (order: Omit<Order, 'id' | 'createdAt'>) => void;
  updateOrder: (order: Order) => void;
  deleteOrder: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
  getOrdersByClientId: (clientId: string) => Order[];
  getOrdersByStatus: (status: OrderStatus) => Order[];
  getOrdersByPaymentStatus: (status: PaymentStatus) => Order[];
  getTotalRevenue: () => number;
  getTotalExpenses: () => number;
  getMonthlyData: () => { month: string; income: number; expenses: number }[];
  getTopClients: () => { clientId: string; clientName: string; revenue: number }[];
  getOrderStatusBreakdown: () => { status: OrderStatus; count: number }[];
}

const initialClients: Client[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    phone: '(555) 123-4567',
    preferredPaymentMethod: 'Bank Transfer',
    notes: 'Long-term client, prefers communication via email',
    createdAt: '2023-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Sarah Williams',
    email: 'sarah@company.com',
    phone: '(555) 234-5678',
    preferredPaymentMethod: 'PayPal',
    notes: 'Requires detailed invoices',
    createdAt: '2023-02-20T14:15:00Z',
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael@business.co',
    phone: '(555) 345-6789',
    preferredPaymentMethod: 'Credit Card',
    notes: 'Always pays on time',
    createdAt: '2023-03-10T09:45:00Z',
  }
];

const initialOrders: Order[] = [
  {
    id: '1',
    clientId: '1',
    title: 'Website Redesign',
    description: 'Complete overhaul of company website with new branding',
    deadline: '2023-06-30T23:59:59Z',
    cost: 3500,
    paymentStatus: 'partial',
    status: 'pending',
    createdAt: '2023-05-05T08:30:00Z',
  },
  {
    id: '2',
    clientId: '2',
    title: 'Logo Design',
    description: 'Create a modern logo with brand guidelines',
    deadline: '2023-05-20T23:59:59Z',
    cost: 800,
    paymentStatus: 'paid',
    status: 'complete',
    createdAt: '2023-05-01T10:15:00Z',
  },
  {
    id: '3',
    clientId: '3',
    title: 'Social Media Campaign',
    description: 'Design assets for summer promotion',
    deadline: '2023-05-15T23:59:59Z',
    cost: 1200,
    paymentStatus: 'unpaid',
    status: 'overdue',
    createdAt: '2023-04-20T14:30:00Z',
  },
  {
    id: '4',
    clientId: '1',
    title: 'Email Newsletter Template',
    description: 'Design responsive email template',
    deadline: '2023-06-10T23:59:59Z',
    cost: 600,
    paymentStatus: 'unpaid',
    status: 'pending',
    createdAt: '2023-05-25T11:45:00Z',
  }
];

const initialExpenses: Expense[] = [
  {
    id: '1',
    title: 'Adobe Creative Cloud Subscription',
    amount: 52.99,
    date: '2023-05-01T00:00:00Z',
    category: 'tools',
    notes: 'Monthly subscription',
  },
  {
    id: '2',
    title: 'Home Office Internet',
    amount: 89.99,
    date: '2023-05-05T00:00:00Z',
    category: 'utilities',
    notes: 'Business internet plan',
  },
  {
    id: '3',
    title: 'Client Meeting Coffee',
    amount: 24.50,
    date: '2023-05-12T00:00:00Z',
    category: 'travel',
    notes: 'Meeting with Alex from Johnson Inc',
  }
];

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>(() => {
    const savedClients = localStorage.getItem('clients');
    return savedClients ? JSON.parse(savedClients) : initialClients;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const savedOrders = localStorage.getItem('orders');
    return savedOrders ? JSON.parse(savedOrders) : initialOrders;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const savedExpenses = localStorage.getItem('expenses');
    return savedExpenses ? JSON.parse(savedExpenses) : initialExpenses;
  });

  // Save to localStorage whenever data changes
  React.useEffect(() => {
    localStorage.setItem('clients', JSON.stringify(clients));
  }, [clients]);

  React.useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  React.useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);

  // Client functions
  const addClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...client,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setClients([...clients, newClient]);
  };

  const updateClient = (client: Client) => {
    setClients(clients.map(c => c.id === client.id ? client : c));
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter(client => client.id !== id));
    // Optional: Also delete associated orders
    setOrders(orders.filter(order => order.clientId !== id));
  };

  // Order functions
  const addOrder = (order: Omit<Order, 'id' | 'createdAt'>) => {
    const newOrder: Order = {
      ...order,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    setOrders([...orders, newOrder]);
  };

  const updateOrder = (order: Order) => {
    setOrders(orders.map(o => o.id === order.id ? order : o));
  };

  const deleteOrder = (id: string) => {
    setOrders(orders.filter(order => order.id !== id));
  };

  // Expense functions
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...expense,
      id: uuidv4(),
    };
    setExpenses([...expenses, newExpense]);
  };

  const updateExpense = (expense: Expense) => {
    setExpenses(expenses.map(e => e.id === expense.id ? expense : e));
  };

  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  // Helper functions
  const getClientById = (id: string) => {
    return clients.find(client => client.id === id);
  };

  const getOrdersByClientId = (clientId: string) => {
    return orders.filter(order => order.clientId === clientId);
  };

  const getOrdersByStatus = (status: OrderStatus) => {
    return orders.filter(order => order.status === status);
  };

  const getOrdersByPaymentStatus = (status: PaymentStatus) => {
    return orders.filter(order => order.paymentStatus === status);
  };

  // Analytics functions
  const getTotalRevenue = () => {
    return orders.reduce((total, order) => {
      if (order.paymentStatus === 'paid') {
        return total + order.cost;
      } else if (order.paymentStatus === 'partial') {
        return total + (order.cost / 2); // Assuming 50% for partial for this example
      }
      return total;
    }, 0);
  };

  const getTotalExpenses = () => {
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  };

  const getMonthlyData = () => {
    const months: { [key: string]: { income: number; expenses: number } } = {};

    // Process orders
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!months[monthYear]) {
        months[monthYear] = { income: 0, expenses: 0 };
      }

      if (order.paymentStatus === 'paid') {
        months[monthYear].income += order.cost;
      } else if (order.paymentStatus === 'partial') {
        months[monthYear].income += (order.cost / 2);
      }
    });

    // Process expenses
    expenses.forEach(expense => {
      const date = new Date(expense.date);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!months[monthYear]) {
        months[monthYear] = { income: 0, expenses: 0 };
      }

      months[monthYear].expenses += expense.amount;
    });

    // Convert to array format for charts
    return Object.entries(months).map(([month, data]) => {
      const [year, monthNum] = month.split('-');
      const monthName = new Date(Number(year), Number(monthNum) - 1).toLocaleString('default', { month: 'short' });
      return {
        month: `${monthName} ${year}`,
        income: data.income,
        expenses: data.expenses
      };
    }).sort((a, b) => {
      const [aMonth, aYear] = a.month.split(' ');
      const [bMonth, bYear] = b.month.split(' ');
      return Number(aYear) - Number(bYear) || 
             new Date(Date.parse(`${aMonth} 1, 2000`)).getMonth() - 
             new Date(Date.parse(`${bMonth} 1, 2000`)).getMonth();
    });
  };

  const getTopClients = () => {
    const clientRevenue: { [key: string]: number } = {};

    orders.forEach(order => {
      if (!clientRevenue[order.clientId]) {
        clientRevenue[order.clientId] = 0;
      }

      if (order.paymentStatus === 'paid') {
        clientRevenue[order.clientId] += order.cost;
      } else if (order.paymentStatus === 'partial') {
        clientRevenue[order.clientId] += (order.cost / 2);
      }
    });

    return Object.entries(clientRevenue)
      .map(([clientId, revenue]) => {
        const client = getClientById(clientId);
        return {
          clientId,
          clientName: client ? client.name : 'Unknown Client',
          revenue
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const getOrderStatusBreakdown = () => {
    const statusCounts = {
      pending: getOrdersByStatus('pending').length,
      complete: getOrdersByStatus('complete').length,
      overdue: getOrdersByStatus('overdue').length
    };

    return Object.entries(statusCounts).map(([status, count]) => ({
      status: status as OrderStatus,
      count
    }));
  };

  return (
    <DataContext.Provider value={{
      clients,
      orders,
      expenses,
      addClient,
      updateClient,
      deleteClient,
      addOrder,
      updateOrder,
      deleteOrder,
      addExpense,
      updateExpense,
      deleteExpense,
      getClientById,
      getOrdersByClientId,
      getOrdersByStatus,
      getOrdersByPaymentStatus,
      getTotalRevenue,
      getTotalExpenses,
      getMonthlyData,
      getTopClients,
      getOrderStatusBreakdown,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
