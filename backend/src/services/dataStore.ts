import fs from 'fs';
import path from 'path';

// In CJS, __dirname is available globally
const DATA_DIR = path.resolve(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

export interface ITenantData {
  _id: string;
  name: string;
  displayName: string;
  slug: string;
  subdomain: string;
  gstin?: string;
  status: 'active' | 'trial' | 'suspended';
  owner: {
    name: string;
    email: string;
    phone: string;
  };
  address?: {
    door?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    country?: string;
  };
  branding?: {
    companyName?: string;
    supportPhone?: string;
    supportEmail?: string;
  };
  plan?: {
    name: string;
    maxCustomers: number;
    maxDevices: number;
    monthlyFee: number;
  };
  stats?: {
    subscribers: number;
    devices: number;
    onlineDevices: number;
    reportingDevices: number;
    users: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface IUserData {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  tenantId?: string;
  tenantSlug?: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface IDeviceData {
  _id: string;
  serialNumber: string;
  tenantId: string;
  tenantSlug: string;
  manufacturer?: string;
  model?: string;
  hardwareVersion?: string;
  softwareVersion?: string;
  ipAddress?: string;
  macAddress?: string;
  status: 'online' | 'offline' | 'warning';
  rxPower?: number;
  txPower?: number;
  ponPort?: string;
  oltName?: string;
  customerName?: string;
  planName?: string;
  wifiSsid?: string;
  pppoeUsername?: string;
  lastInform?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICustomerData {
  _id: string;
  tenantId: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  planName: string;
  status: 'active' | 'suspended';
  assignedDeviceId?: string;
  createdAt: string;
}

export interface IStoreData {
  tenants: ITenantData[];
  users: IUserData[];
  devices: IDeviceData[];
  customers: ICustomerData[];
  pendingMappings: any[];
  auditLogs: any[];
  settings: any;
}

class LocalDataStore {
  private data: IStoreData = {
    tenants: [],
    users: [],
    devices: [],
    customers: [],
    pendingMappings: [],
    auditLogs: [],
    settings: {
      alertEmail: 'admin@isp.local',
      alertMobile: '+91 98450 00000',
      whatsappNotifications: true,
      emailNotifications: true,
      informInterval: 60,
    },
  };

  constructor() {
    this.ensureDataDir();
    this.load();
  }

  private ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load() {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        console.log(`[DataStore] Loaded ${this.data.tenants.length} tenants and ${this.data.devices.length} devices from disk.`);
      } else {
        this.clearAllDummyData();
      }
    } catch (err) {
      console.error('[DataStore] Error loading store.json:', err);
    }
  }

  public save() {
    try {
      this.ensureDataDir();
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DataStore] Error saving store.json:', err);
    }
  }

  // Clear all dummy data explicitly - pure clean state!
  public clearAllDummyData() {
    this.data = {
      tenants: [],
      devices: [],
      customers: [],
      pendingMappings: [],
      users: [
        {
          _id: 'dev_superadmin_01',
          fullName: 'Super Administrator',
          email: 'admin@isp.local',
          phone: '+91 98450 00000',
          role: 'super_admin',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
      ],
      auditLogs: [
        {
          _id: 'audit_01',
          action: 'PLATFORM_INITIALIZED',
          actor: 'System Engine',
          details: 'Ready-to-launch state initialized with zero dummy records.',
          timestamp: new Date().toISOString(),
        },
      ],
      settings: {
        alertEmail: 'admin@isp.local',
        alertMobile: '+91 98450 00000',
        whatsappNotifications: true,
        emailNotifications: true,
        informInterval: 60,
      },
    };
    this.save();
    console.log('[DataStore] All dummy data wiped clean. Zero dummy tenants. Ready to launch.');
  }

  // --- TENANTS ---
  public getTenants(search?: string, status?: string): ITenantData[] {
    let result = [...this.data.tenants];
    if (status && status !== 'all') {
      result = result.filter((t) => t.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.displayName.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          t.owner?.email.toLowerCase().includes(q)
      );
    }

    return result.map((t) => {
      const tenantDevices = this.data.devices.filter((d) => d.tenantId === t._id || d.tenantSlug === t.slug);
      const onlineCount = tenantDevices.filter((d) => d.status === 'online').length;
      const reportingCount = tenantDevices.filter((d) => d.lastInform != null).length;
      const customerCount = this.data.customers.filter((c) => c.tenantId === t._id).length;
      const userCount = this.data.users.filter((u) => u.tenantId === t._id || u.tenantSlug === t.slug).length;

      return {
        ...t,
        stats: {
          subscribers: customerCount,
          devices: tenantDevices.length,
          onlineDevices: onlineCount,
          reportingDevices: reportingCount,
          users: Math.max(1, userCount),
        },
      };
    });
  }

  public getTenantById(id: string): ITenantData | undefined {
    return this.data.tenants.find((t) => t._id === id);
  }

  public getTenantBySlug(slug: string): ITenantData | undefined {
    const s = slug.toLowerCase().trim();
    return this.data.tenants.find((t) => t.slug.toLowerCase() === s);
  }

  public createTenant(input: any): ITenantData {
    const cleanSlug = (input.slug || input.name || 'operator').toLowerCase().replace(/[^a-z0-9-]/g, '').trim();
    const existing = this.getTenantBySlug(cleanSlug);
    if (existing) {
      throw new Error(`Subdomain slug '${cleanSlug}' is already taken. Please choose a different slug.`);
    }

    const tenantId = 'tenant_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const newTenant: ITenantData = {
      _id: tenantId,
      name: input.name || 'ISP Operator',
      displayName: input.displayName || input.name || 'ISP Operator',
      slug: cleanSlug,
      subdomain: `${cleanSlug}.localhost`,
      gstin: input.gstin || '',
      status: input.status || 'active',
      owner: {
        name: input.owner?.name || input.ownerName || 'Operator Admin',
        email: input.owner?.email || input.ownerEmail || 'admin@' + cleanSlug + '.local',
        phone: input.owner?.phone || input.ownerPhone || '+91 98450 00001',
      },
      address: {
        door: input.address?.door || input.door || '',
        street: input.address?.street || input.street || '',
        city: input.address?.city || input.city || 'Hyderabad',
        state: input.address?.state || input.state || 'Telangana',
        pincode: input.address?.pincode || input.pincode || '500081',
        country: input.address?.country || 'India',
      },
      branding: {
        companyName: input.branding?.companyName || input.displayName || input.name,
        supportPhone: input.branding?.supportPhone || input.supportPhone || input.owner?.phone || input.ownerPhone || '',
        supportEmail: input.branding?.supportEmail || input.supportEmail || input.owner?.email || input.ownerEmail || '',
      },
      plan: {
        name: input.plan?.name || input.planTier || 'Growth ISP Plan',
        maxCustomers: input.plan?.maxCustomers || 5000,
        maxDevices: input.plan?.maxDevices || 5000,
        monthlyFee: input.plan?.monthlyFee || 4999,
      },
      createdAt: now,
      updatedAt: now,
      stats: {
        subscribers: 0,
        devices: 0,
        onlineDevices: 0,
        reportingDevices: 0,
        users: 1,
      },
    };

    this.data.tenants.unshift(newTenant);

    // Automatically create Operator Admin user for login
    const operatorUser: IUserData = {
      _id: 'user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      fullName: newTenant.owner.name,
      email: newTenant.owner.email,
      phone: newTenant.owner.phone,
      role: 'operator_admin',
      tenantId: newTenant._id,
      tenantSlug: newTenant.slug,
      status: 'active',
      createdAt: now,
    };
    this.data.users.push(operatorUser);

    this.save();
    console.log(`[DataStore] Provisioned and saved ISP Tenant '${newTenant.displayName}' (slug: '${newTenant.slug}', ACS URL: /tr069/${newTenant.slug})`);
    return newTenant;
  }

  public updateTenant(id: string, input: any): ITenantData | null {
    const idx = this.data.tenants.findIndex((t) => t._id === id);
    if (idx === -1) return null;

    const existing = this.data.tenants[idx];
    const updated: ITenantData = {
      ...existing,
      name: input.name ?? existing.name,
      displayName: input.displayName ?? existing.displayName,
      status: input.status ?? existing.status,
      gstin: input.gstin ?? existing.gstin,
      owner: {
        ...existing.owner,
        ...(input.owner || {}),
      },
      address: {
        ...existing.address,
        ...(input.address || {}),
      },
      branding: {
        ...existing.branding,
        ...(input.branding || {}),
      },
      plan: {
        ...existing.plan,
        ...(input.plan || {}),
      },
      updatedAt: new Date().toISOString(),
    };

    this.data.tenants[idx] = updated;
    this.save();
    return updated;
  }

  public deleteTenant(id: string): boolean {
    this.data.tenants = this.data.tenants.filter((t) => t._id !== id);
    this.data.users = this.data.users.filter((u) => u.tenantId !== id);
    this.save();
    return true;
  }

  // --- USERS ---
  public getUsers(search?: string, role?: string, status?: string): IUserData[] {
    let result = [...this.data.users];
    if (role && role !== 'all') {
      result = result.filter((u) => u.role === role);
    }
    if (status && status !== 'all') {
      result = result.filter((u) => u.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q));
    }
    return result;
  }

  public findUserByEmailOrPhone(credential: string, role?: string): IUserData | undefined {
    const cred = credential.toLowerCase().trim();
    return this.data.users.find((u) => {
      const matchCred = u.email.toLowerCase() === cred || u.phone.replace(/[^0-9]/g, '').includes(cred.replace(/[^0-9]/g, ''));
      if (role) return matchCred && u.role === role;
      return matchCred;
    });
  }

  // --- PLANS ---
  public getPlans() {
    return [
      {
        _id: 'plan_starter',
        name: 'Starter ISP Plan',
        description: 'Ideal for local cable operators (LCOs) and early stage broadband startups.',
        maxCustomers: 1000,
        maxDevices: 1000,
        monthlyFee: 1999,
        annualFee: 19990,
        features: ['Up to 1,000 ONTs', 'TR-069 ACS Server', 'Billing & Invoicing', 'WhatsApp Alerts'],
        status: 'active',
      },
      {
        _id: 'plan_growth',
        name: 'Growth ISP Plan',
        description: 'For growing regional fiber broadband networks with automated ACS provisioning.',
        maxCustomers: 5000,
        maxDevices: 5000,
        monthlyFee: 4999,
        annualFee: 49990,
        features: ['Up to 5,000 ONTs', 'Automated WAN Provisioning', 'Fiber GIS Mapping', 'WhatsApp Live Chatbot', 'Priority NOC Support'],
        status: 'active',
      },
      {
        _id: 'plan_enterprise',
        name: 'Enterprise Tier',
        description: 'For multi-city telcos, tier-2 ISPs, and high density fiber distribution operators.',
        maxCustomers: 25000,
        maxDevices: 25000,
        monthlyFee: 14999,
        annualFee: 149990,
        features: ['Up to 25,000 ONTs', 'Dedicated OLT High-Speed Poller', 'Full AI Incident Diagnosis', 'Custom Domain & Whitelabel', '24/7 SLA Guarantee'],
        status: 'active',
      },
    ];
  }

  // --- SETTINGS ---
  public getSettings() {
    return this.data.settings;
  }

  public updateSettings(input: any) {
    this.data.settings = { ...this.data.settings, ...input };
    this.save();
    return this.data.settings;
  }

  // --- PENDING MAPPINGS ---
  public getPendingMappings() {
    return this.data.pendingMappings || [];
  }

  // --- AUDIT LOGS ---
  public getAuditLogs() {
    return this.data.auditLogs || [];
  }

  // --- DEVICES (ONTs / CPEs) ---
  public getDevices(tenantId?: string, tenantSlug?: string): IDeviceData[] {
    if (tenantId) {
      return this.data.devices.filter((d) => d.tenantId === tenantId);
    }
    if (tenantSlug) {
      return this.data.devices.filter((d) => d.tenantSlug === tenantSlug);
    }
    return [...this.data.devices];
  }

  public getDeviceById(id: string): IDeviceData | undefined {
    return this.data.devices.find((d) => d._id === id);
  }

  public getDeviceBySerial(serial: string): IDeviceData | undefined {
    const s = serial.toUpperCase().trim();
    return this.data.devices.find((d) => d.serialNumber.toUpperCase() === s);
  }

  public upsertDevice(deviceInput: Partial<IDeviceData> & { serialNumber: string; tenantSlug?: string }): IDeviceData {
    const serial = deviceInput.serialNumber.trim().toUpperCase();
    let tenant = deviceInput.tenantSlug ? this.getTenantBySlug(deviceInput.tenantSlug) : undefined;
    if (!tenant && this.data.tenants.length > 0) {
      tenant = this.data.tenants[0]; // fallback to first active tenant if single operator
    }

    const tenantId = tenant?._id || 'unassigned';
    const tenantSlug = tenant?.slug || 'quarantine';
    const now = new Date().toISOString();

    const existingIdx = this.data.devices.findIndex((d) => d.serialNumber.toUpperCase() === serial);

    if (existingIdx !== -1) {
      const existing = this.data.devices[existingIdx];
      const updated: IDeviceData = {
        ...existing,
        ...deviceInput,
        tenantId: tenantId !== 'unassigned' ? tenantId : existing.tenantId,
        tenantSlug: tenantSlug !== 'quarantine' ? tenantSlug : existing.tenantSlug,
        status: 'online',
        lastInform: now,
        updatedAt: now,
      };
      this.data.devices[existingIdx] = updated;
      this.save();
      console.log(`[DataStore] Live ONT Inform: Updated ${serial} under tenant '${updated.tenantSlug}' (IP: ${updated.ipAddress || 'unknown'})`);
      return updated;
    } else {
      const newDev: IDeviceData = {
        _id: 'dev_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        serialNumber: serial,
        tenantId,
        tenantSlug,
        manufacturer: deviceInput.manufacturer || 'Optronix',
        model: deviceInput.model || 'GPON ONT 4GE+WiFi',
        hardwareVersion: deviceInput.hardwareVersion || 'V2.1',
        softwareVersion: deviceInput.softwareVersion || 'OPTX_FW_v3.4',
        ipAddress: deviceInput.ipAddress || '192.168.1.1',
        macAddress: deviceInput.macAddress || '',
        status: 'online',
        rxPower: deviceInput.rxPower ?? -19.4,
        txPower: deviceInput.txPower ?? 2.1,
        ponPort: deviceInput.ponPort || 'PON-01/1',
        oltName: deviceInput.oltName || 'Main OLT',
        customerName: deviceInput.customerName || 'Pending Assignment',
        planName: deviceInput.planName || 'Fiber Standard',
        lastInform: now,
        createdAt: now,
        updatedAt: now,
      };
      this.data.devices.unshift(newDev);
      this.save();
      console.log(`[DataStore] Live ONT Inform: Registered NEW ${serial} under tenant '${tenantSlug}' (IP: ${newDev.ipAddress})`);
      return newDev;
    }
  }

  // --- CUSTOMERS ---
  public getCustomers(tenantId?: string): ICustomerData[] {
    if (tenantId) {
      return this.data.customers.filter((c) => c.tenantId === tenantId);
    }
    return [...this.data.customers];
  }

  // --- OVERALL KPI STATS ---
  public getKpis() {
    const totalTenants = this.data.tenants.length;
    const activeTenants = this.data.tenants.filter((t) => t.status === 'active').length;
    const totalDevices = this.data.devices.length;
    const onlineDevices = this.data.devices.filter((d) => d.status === 'online').length;
    const offlineDevices = Math.max(0, totalDevices - onlineDevices);
    const onlineRatio = totalDevices > 0 ? Number(((onlineDevices / totalDevices) * 100).toFixed(1)) : 100;
    const totalCustomers = this.data.customers.length;
    const mrr = activeTenants * 4999;
    const arr = mrr * 12;

    return {
      totalTenants,
      activeTenants,
      totalCustomers,
      totalDevices,
      onlineDevices,
      offlineDevices,
      onlineRatio,
      criticalAlarms: 0,
      activeIncidents: 0,
      mrr,
      arr,
    };
  }
}

export const dataStore = new LocalDataStore();
