import { dataStore } from '../services/dataStore.js';
import mongoose from 'mongoose';
import { Router, Response } from 'express';
import { Types } from 'mongoose';
import { Tenant } from '../models/Tenant.js';
import { User } from '../models/User.js';
import { Device } from '../models/Device.js';
import { Customer } from '../models/Customer.js';
import { Incident } from '../models/Incident.js';
import { AuditLog } from '../models/AuditLog.js';
import { TenantPlan } from '../models/TenantPlan.js';
import { SystemSetting } from '../models/SystemSetting.js';
import { PendingDeviceMapping } from '../models/PendingDeviceMapping.js';
import { AuthenticatedRequest } from '../middleware/tenantIsolation.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { recordAuditLog } from '../middleware/audit.js';
import { EventBusService } from '../services/eventBusService.js';
import { EmailService } from '../services/emailService.js';
import { WhatsAppService } from '../services/whatsAppService.js';

export const superAdminRouter = Router();

// Apply Super Admin security boundary
superAdminRouter.use(authenticateToken);
superAdminRouter.use(requireRole(['super_admin']));

/**
 * 6.2 Executive Dashboard KPIs
 */
superAdminRouter.get('/dashboard', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const kpis = dataStore.getKpis();
    const tenants = dataStore.getTenants();
    const allDevices = dataStore.getDevices();
    const onlineDevices = allDevices.filter(d => d.status === 'online');
    const offlineDevices = allDevices.filter(d => d.status !== 'online');

    return res.json({
      success: true,
      kpis,
      recentTenants: tenants.slice(0, 5),
      recentOnlineDevices: onlineDevices.slice(0, 8),
      recentOfflineDevices: offlineDevices.slice(0, 8),
      platformHealth: {
        database: 'STANDALONE_SECURE_STORE',
        cwmpAcsPort: 7547,
        serverPort: 4000,
        uptimeSeconds: process.uptime(),
      },
      aiExecutiveSummary: tenants.length === 0
        ? 'Platform initialized and ready to launch. Please provision your first ISP Operator Tenant to connect your physical GPON ONT.'
        : `Operating normally with ${tenants.length} ISP tenant(s) and ${allDevices.length} managed ONT(s). Multi-tenant TR-069 CWMP telemetry active.`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 6.3 Tenant List with search, status filters, pagination
 */
superAdminRouter.get('/tenants', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, status } = req.query;
    const tenants = dataStore.getTenants(search as string, status as string);
    return res.json({ success: true, tenants });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 6.4 Tenant Create
 */
superAdminRouter.post('/tenants', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const createdTenant = dataStore.createTenant(req.body);
    return res.status(201).json({
      success: true,
      message: `ISP Operator Tenant '${createdTenant.displayName}' provisioned successfully. Routing slug '${createdTenant.slug}' is now live on TR-069 ACS.`,
      tenant: createdTenant,
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

/**
 * 6.5 Tenant Detail with usage quotas vs real counts & CWMP URL
 */
superAdminRouter.get('/tenants/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, error: 'Tenant not found' });

    const [customerCount, deviceCount, incidentCount, auditLogs] = await Promise.all([
      Customer.countDocuments({ tenantId: tenant._id }),
      Device.countDocuments({ tenantId: tenant._id }),
      Incident.countDocuments({ tenantId: tenant._id }),
      AuditLog.find({ tenantId: tenant._id }).sort({ timestamp: -1 }).limit(10),
    ]);

    const rawHost = (req.headers['x-forwarded-host'] as string) || (req.headers['host'] as string) || process.env.APP_HOST || 'localhost';
    const cleanHost = rawHost.split(':')[0];
    const targetSlug = tenant.slug || 'rudra';
    const cwmpUrl = `http://${targetSlug}.${cleanHost}:7547`;
    const cwmpPathUrl = `http://${cleanHost}:7547/tr069/${targetSlug}`;

    return res.json({
      success: true,
      tenant,
      cwmpUrl,
      cwmpPathUrl,
      usage: {
        customers: { current: customerCount, limit: tenant.plan.maxCustomers },
        devices: { current: deviceCount, limit: tenant.plan.maxDevices },
        technicians: { current: 1, limit: tenant.plan.maxTechnicians },
      },
      incidentCount,
      recentAuditLogs: auditLogs,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Tenant Suspend / Restore
 */
superAdminRouter.patch('/tenants/:id/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.body;
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ success: false, error: 'Tenant not found' });

    const previousStatus = tenant.status;
    tenant.status = status;
    await tenant.save();

    await recordAuditLog({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: `TENANT_STATUS_${status.toUpperCase()}`,
      targetResource: 'Tenant',
      targetId: tenant._id.toString(),
      targetIdentifier: tenant.slug,
      beforeState: { status: previousStatus },
      afterState: { status },
      correlationId: req.correlationId || `sa_stat_${Date.now()}`,
    });

    return res.json({ success: true, tenant });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 6.5.1 Tenant Update / Edit Operator Data
 */
superAdminRouter.put('/tenants/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = dataStore.updateTenant(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Tenant not found' });
    }
    return res.json({ success: true, message: 'Tenant updated successfully', tenant: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 6.5.2 Tenant Delete
 */
superAdminRouter.delete('/tenants/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deleted = dataStore.deleteTenant(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Tenant not found' });
    }
    return res.json({ success: true, message: 'ISP Tenant deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Clear all dummy data endpoint
superAdminRouter.post('/clear-dummy-data', async (req: AuthenticatedRequest, res: Response) => {
  try {
    dataStore.clearAllDummyData();
    return res.json({ success: true, message: 'All dummy records wiped cleanly. System is ready for live deployment.' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 6.6 Global Users & Roles (CRUD)
 * Restricts superadmin users management to global super administrators
 */
superAdminRouter.get('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { search, role, status } = req.query;
    const users = dataStore.getUsers(search as string, role as string, status as string);
    return res.json({ success: true, users, total: users.length });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

superAdminRouter.post('/users', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fullName, email, phone, role, tenantId, status = 'active', permissions } = req.body;

    if (!fullName || !email || !phone || !role) {
      return res.status(400).json({ success: false, error: 'Full Name, Email, Phone, and Role are required.' });
    }

    // Role-based tenant validation
    let assignedTenantId = tenantId;
    if (role === 'super_admin') {
      assignedTenantId = undefined;
    } else if (!assignedTenantId) {
      return res.status(400).json({ success: false, error: 'Tenant context is required for non-superadmin roles.' });
    }

    // Default permissions based on role
    let defaultPermissions = permissions;
    if (!defaultPermissions || defaultPermissions.length === 0) {
      if (role === 'super_admin') defaultPermissions = ['SUPERADMIN_ALL'];
      else if (role === 'operator_admin') defaultPermissions = ['CUSTOMER_ALL', 'DEVICE_ALL', 'GIS_ALL', 'AI_ALL', 'TECH_ALL'];
      else if (role === 'noc_operator') defaultPermissions = ['CUSTOMER_READ', 'DEVICE_READ', 'DEVICE_REBOOT', 'GIS_READ', 'AI_READ'];
      else if (role === 'fiber_planner') defaultPermissions = ['GIS_ALL', 'DEVICE_READ'];
      else if (role === 'technician') defaultPermissions = ['WORKORDER_READ', 'WORKORDER_UPDATE', 'DEVICE_READ'];
      else defaultPermissions = ['CUSTOMER_PORTAL'];
    }

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role,
      tenantId: assignedTenantId || undefined,
      status,
      permissions: defaultPermissions,
    });

    await recordAuditLog({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'USER_CREATED',
      targetResource: 'User',
      targetId: newUser._id.toString(),
      targetIdentifier: newUser.email,
      afterState: newUser.toObject(),
      correlationId: req.correlationId || `usr_create_${Date.now()}`,
    });

    const populatedUser = await User.findById(newUser._id).populate('tenantId', 'name slug displayName');

    return res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: populatedUser,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

superAdminRouter.put('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fullName, email, phone, role, tenantId, status, permissions } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const beforeState = user.toObject();

    if (fullName) user.fullName = fullName.trim();
    if (email) user.email = email.trim().toLowerCase();
    if (phone) user.phone = phone.trim();
    if (role) {
      user.role = role;
      if (role === 'super_admin') {
        user.tenantId = undefined;
      } else if (tenantId) {
        user.tenantId = tenantId;
      }
    }
    if (tenantId !== undefined && role !== 'super_admin') {
      user.tenantId = tenantId || undefined;
    }
    if (status) user.status = status;
    if (permissions && Array.isArray(permissions)) user.permissions = permissions;

    user.updatedAt = new Date();
    await user.save();

    await recordAuditLog({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'USER_UPDATED',
      targetResource: 'User',
      targetId: user._id.toString(),
      targetIdentifier: user.email,
      beforeState,
      afterState: user.toObject(),
      correlationId: req.correlationId || `usr_update_${Date.now()}`,
    });

    const populatedUser = await User.findById(user._id).populate('tenantId', 'name slug displayName');

    return res.json({
      success: true,
      message: 'User updated successfully.',
      user: populatedUser,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

superAdminRouter.delete('/users/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    if (user.role === 'super_admin') {
      const superAdminCount = await User.countDocuments({ role: 'super_admin' });
      if (superAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          error: 'Cannot delete the only Super Administrator account. Please add another super admin first.',
        });
      }
    }

    const beforeState = user.toObject();
    await User.findByIdAndDelete(req.params.id);

    await recordAuditLog({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'USER_DELETED',
      targetResource: 'User',
      targetId: req.params.id,
      targetIdentifier: user.email,
      beforeState,
      correlationId: req.correlationId || `usr_del_${Date.now()}`,
    });

    return res.json({
      success: true,
      message: `User '${user.fullName}' (${user.email}) deleted successfully.`,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 6.7 Plans & Revenue
 */
superAdminRouter.get('/plans', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const plans = dataStore.getPlans();
    return res.json({ success: true, plans, activeSubscribers: dataStore.getTenants().length });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 6.10 Global Audit Log Explorer
 */
superAdminRouter.get('/audit', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const logs = dataStore.getAuditLogs();
    return res.json({ success: true, logs });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Part 1.3: Event Bus Dead-Letter Queue (DLQ) Inspector & Redrive
 */
superAdminRouter.get('/events/dlq', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const dlq = EventBusService.getDeadLetterQueue();
    return res.json({ success: true, dlq, count: dlq.length });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

superAdminRouter.post('/events/dlq/:id/redrive', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const redrived = await EventBusService.redriveDeadLetter(req.params.id);
    return res.json({ success: redrived, message: redrived ? 'Event redriven successfully' : 'Redrive failed' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Super Admin Settings: Retrieve active SMTP and WhatsApp configuration
 */
superAdminRouter.get('/settings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    let setting = await SystemSetting.findOne({ key: 'global_config' });
    if (!setting) {
      setting = await SystemSetting.create({
        key: 'global_config',
        smtp: {
          enabled: false,
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          user: '',
          pass: '',
          fromEmail: '',
          fromName: 'AI ISP OS Security',
        },
        whatsapp: {
          enabled: true,
          status: 'DISCONNECTED',
          sessionName: 'primary_isp_session',
        },
      });
    }

    // Mask password before returning
    const rawSmtp: any = (setting.toObject ? setting.toObject().smtp : setting.smtp) || {};
    const safeSmtp = {
      host: rawSmtp.host || 'smtp.gmail.com',
      port: rawSmtp.port || 465,
      user: rawSmtp.user || '',
      pass: rawSmtp.pass ? '••••••••••••••••' : '',
      fromName: rawSmtp.fromName || 'AI ISP OS Security',
      fromEmail: rawSmtp.fromEmail || rawSmtp.user || '',
      isConfigured: Boolean(rawSmtp.user && rawSmtp.pass),
      enabled: Boolean(rawSmtp.enabled),
    };

    return res.json({
      success: true,
      settings: {
        smtp: safeSmtp,
        whatsapp: setting.whatsapp,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Super Admin Settings: Save Google Email & App Password
 */
superAdminRouter.post('/settings/smtp', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user, pass, fromName, host = 'smtp.gmail.com', port = 465, secure = true } = req.body;

    if (!user) {
      return res.status(400).json({ success: false, error: 'Google email address is required.' });
    }

    let setting = await SystemSetting.findOne({ key: 'global_config' });
    if (!setting) {
      setting = new SystemSetting({ key: 'global_config' });
    }

    setting.smtp.user = user.trim().toLowerCase();
    if (pass && pass !== '••••••••••••••••') {
      setting.smtp.pass = pass.replace(/\s+/g, ''); // 16-character Google App Password without spaces
    }
    setting.smtp.host = host;
    setting.smtp.port = Number(port);
    setting.smtp.secure = Boolean(secure);
    setting.smtp.fromEmail = user.trim().toLowerCase();
    setting.smtp.fromName = fromName || 'AI ISP OS Platform';
    setting.smtp.enabled = Boolean(setting.smtp.user && setting.smtp.pass);
    setting.smtp.updatedAt = new Date();

    await setting.save();

    await recordAuditLog({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'UPDATE_SMTP_SETTINGS',
      targetResource: 'SystemSetting',
      targetId: setting._id.toString(),
      correlationId: req.correlationId || `smtp_${Date.now()}`,
    });

    return res.json({
      success: true,
      message: 'Gmail SMTP credentials saved successfully. Email OTP dispatch is now enabled.',
      smtp: {
        user: setting.smtp.user,
        host: setting.smtp.host,
        port: setting.smtp.port,
        fromName: setting.smtp.fromName,
        isConfigured: Boolean(setting.smtp.user && setting.smtp.pass),
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Super Admin Settings: Test Gmail SMTP Connection & Send Verification Email
 */
superAdminRouter.post('/settings/smtp/test', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user, pass, targetEmail = req.user!.email } = req.body;

    let smtpConfig = await EmailService.getSmtpConfig();
    if (user && pass && pass !== '••••••••••••••••') {
      smtpConfig = {
        enabled: true,
        host: req.body.host || 'smtp.gmail.com',
        port: Number(req.body.port) || 465,
        secure: req.body.secure ?? true,
        user: user.trim(),
        pass: pass.replace(/\s+/g, ''),
        fromEmail: user.trim(),
        fromName: req.body.fromName || 'AI ISP OS Platform',
      };
    }

    if (!smtpConfig || !smtpConfig.user || !smtpConfig.pass) {
      return res.status(400).json({ success: false, error: 'Google email and App Password are required to test.' });
    }

    const testResult = await EmailService.testConnection(smtpConfig, targetEmail);
    return res.json(testResult);
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Super Admin Settings: WhatsApp Web - Get Status / QR Code
 */
superAdminRouter.get('/settings/whatsapp/status', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const whatsapp = await WhatsAppService.getSessionConfig();
    return res.json({ success: true, whatsapp });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Super Admin Settings: WhatsApp Web - Generate Fresh Pairing QR Code
 */
superAdminRouter.post('/settings/whatsapp/generate-qr', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { forceFresh } = req.body;
    const qrResult = await WhatsAppService.generateQrCode(Boolean(forceFresh));
    return res.json({ success: true, ...qrResult });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Super Admin Settings: WhatsApp Web - Confirm / Simulate Successful Scan Pairing
 */
superAdminRouter.post('/settings/whatsapp/confirm-scan', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { phone = '+919988776655', deviceInfo = 'WhatsApp Business for Android (v2.24.18)' } = req.body;
    const session = await WhatsAppService.confirmPairing(phone, deviceInfo);

    await recordAuditLog({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'WHATSAPP_SESSION_PAIRED',
      targetResource: 'SystemSetting',
      targetId: 'whatsapp_session',
      correlationId: req.correlationId || `wa_pair_${Date.now()}`,
    });

    return res.json({
      success: true,
      message: `WhatsApp Business session successfully connected for ${phone}`,
      whatsapp: session,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Super Admin Settings: WhatsApp Web - Disconnect Session
 */
superAdminRouter.post('/settings/whatsapp/disconnect', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const session = await WhatsAppService.disconnectSession();
    return res.json({
      success: true,
      message: 'WhatsApp session disconnected.',
      whatsapp: session,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Super Admin Settings: WhatsApp Web - Send Test Message
 */
superAdminRouter.post('/settings/whatsapp/test', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { phone, message } = req.body;
    if (!phone) return res.status(400).json({ success: false, error: 'Target mobile number is required' });

    const result = await WhatsAppService.sendTestMessage(phone, message || 'Test alert from AI ISP OS Platform');
    return res.json({
      success: true,
      message: `Test WhatsApp message sent to ${phone}`,
      messageId: result.messageId,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * =========================================================================
 * 6.10 Pending Operator Mappings & WhatsApp Alert Settings (Strict CWMP Multi-Tenant Isolation)
 * =========================================================================
 */

/**
 * GET /api/superadmin/pending-mappings
 * List pending unmapped CPEs with search, status filters, and pagination
 */
superAdminRouter.get('/pending-mappings', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const mappings = dataStore.getPendingMappings();
    return res.json({ success: true, mappings, total: mappings.length });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/superadmin/pending-mappings/count
 * Returns pending badge count for navbar
 */
superAdminRouter.get('/pending-mappings/count', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const count = dataStore.getPendingMappings().length;
    return res.json({ success: true, count });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/superadmin/pending-mappings/:id/assign
 * Super Admin manually binds an unmapped CPE to a chosen Operator Tenant
 */
superAdminRouter.post('/pending-mappings/:id/assign', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.body;

    if (!tenantId) {
      return res.status(400).json({ success: false, error: 'Target Operator Tenant is required' });
    }

    const targetTenant = await Tenant.findById(tenantId);
    if (!targetTenant) {
      return res.status(404).json({ success: false, error: 'Selected Operator Tenant not found' });
    }

    const pending = await PendingDeviceMapping.findById(id);
    if (!pending) {
      return res.status(404).json({ success: false, error: 'Pending device record not found' });
    }

    // Update PendingDeviceMapping record
    pending.status = 'MAPPED';
    pending.mappedTenantId = targetTenant._id as any;
    pending.mappedTenantSlug = targetTenant.slug;
    pending.mappedBy = new Types.ObjectId(req.user!.id) as any;
    pending.mappedAt = new Date();
    await pending.save();

    // Check if Device already exists in DB -> update tenantId, otherwise create in operator fleet
    let device = await Device.findOne({ serialNumber: pending.serialNumber });
    if (device) {
      device.tenantId = targetTenant._id as any;
      device.status = 'online';
      await device.save();
    } else {
      device = await Device.create({
        tenantId: targetTenant._id,
        deviceIdStr: `dev_${Date.now()}_${pending.serialNumber.slice(-4)}`,
        serialNumber: pending.serialNumber,
        macAddress: pending.macAddress || `00:E0:${pending.clientIp?.split('.').map((p) => parseInt(p).toString(16).padStart(2, '0')).slice(-4).join(':') || '00:00:00:00'}`,
        manufacturer: pending.manufacturer || 'Generic GPON',
        modelName: pending.productClass || 'GPON-ONT',
        hardwareVersion: pending.hardwareVersion || 'V1.0',
        softwareVersion: pending.softwareVersion || 'V1.0.0',
        protocol: 'TR-069',
        status: 'online',
        lastInform: new Date(),
        ipAddress: pending.clientIp,
        externalIpAddress: pending.clientIp,
        opticalStatus: 'normal',
        assigned: false,
        rawParameters: {},
        wifi24: {
          ssid: '',
          password: '',
          enabled: true,
          channel: 6,
          channelAuto: true,
          bandwidthMhz: 20,
          securityMode: 'WPA2-PSK',
          txPowerPercent: 100,
        },
        wifi5g: {
          ssid: '',
          password: '',
          enabled: true,
          channel: 44,
          channelAuto: true,
          bandwidthMhz: 80,
          securityMode: 'WPA2-PSK',
          txPowerPercent: 100,
        },
      });
    }

    await recordAuditLog({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'DEVICE_MAPPED_TO_TENANT',
      targetResource: 'PendingDeviceMapping',
      targetId: pending.serialNumber,
      correlationId: `map_${pending.serialNumber}_${Date.now()}`,
      afterState: {
        serialNumber: pending.serialNumber,
        targetTenantSlug: targetTenant.slug,
        targetTenantName: targetTenant.displayName || targetTenant.name,
      },
    });

    return res.json({
      success: true,
      message: `Device ${pending.serialNumber} successfully assigned to ${targetTenant.displayName || targetTenant.name} (${targetTenant.slug})`,
      pending,
      device,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/superadmin/pending-mappings/bulk-assign
 * Super Admin bulk binds multiple unmapped CPEs to a chosen Operator Tenant
 */
superAdminRouter.post('/pending-mappings/bulk-assign', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { ids, tenantId, assignAllPending } = req.body;

    if (!tenantId) {
      return res.status(400).json({ success: false, error: 'Target Operator Tenant is required' });
    }

    const targetTenant = await Tenant.findById(tenantId);
    if (!targetTenant) {
      return res.status(404).json({ success: false, error: 'Selected Operator Tenant not found' });
    }

    let filter: any = {};
    if (assignAllPending) {
      filter = { status: 'PENDING' };
    } else if (Array.isArray(ids) && ids.length > 0) {
      filter = { _id: { $in: ids } };
    } else {
      return res.status(400).json({ success: false, error: 'No devices selected for bulk assignment' });
    }

    const pendings = await PendingDeviceMapping.find(filter);
    if (pendings.length === 0) {
      return res.status(404).json({ success: false, error: 'No matching pending devices found' });
    }

    let assignedCount = 0;
    const now = new Date();

    for (const pending of pendings) {
      pending.status = 'MAPPED';
      pending.mappedTenantId = targetTenant._id as any;
      pending.mappedTenantSlug = targetTenant.slug;
      pending.mappedBy = new Types.ObjectId(req.user!.id) as any;
      pending.mappedAt = now;
      await pending.save();

      let device = await Device.findOne({ serialNumber: pending.serialNumber });
      if (device) {
        device.tenantId = targetTenant._id as any;
        device.status = 'online';
        await device.save();
      } else {
        await Device.create({
          tenantId: targetTenant._id,
          deviceIdStr: `dev_${Date.now()}_${pending.serialNumber.slice(-4)}`,
          serialNumber: pending.serialNumber,
          macAddress: pending.macAddress || `00:E0:${pending.clientIp?.split('.').map((p) => parseInt(p).toString(16).padStart(2, '0')).slice(-4).join(':') || '00:00:00:00'}`,
          manufacturer: pending.manufacturer || 'Generic GPON',
          modelName: pending.productClass || 'GPON-ONT',
          hardwareVersion: pending.hardwareVersion || 'V1.0',
          softwareVersion: pending.softwareVersion || 'V1.0.0',
          protocol: 'TR-069',
          status: 'online',
          lastInform: now,
          ipAddress: pending.clientIp,
          externalIpAddress: pending.clientIp,
          opticalStatus: 'normal',
          assigned: false,
          rawParameters: {},
          wifi24: {
            ssid: '',
            password: '',
            enabled: true,
            channel: 6,
            channelAuto: true,
            bandwidthMhz: 20,
            securityMode: 'WPA2-PSK',
            txPowerPercent: 100,
          },
          wifi5g: {
            ssid: '',
            password: '',
            enabled: true,
            channel: 44,
            channelAuto: true,
            bandwidthMhz: 80,
            securityMode: 'WPA2-PSK',
            txPowerPercent: 100,
          },
        });
      }
      assignedCount++;
    }

    await recordAuditLog({
      actorId: req.user!.id,
      actorEmail: req.user!.email,
      actorRole: req.user!.role,
      action: 'BULK_DEVICES_MAPPED_TO_TENANT',
      targetResource: 'PendingDeviceMapping',
      targetId: targetTenant.slug,
      correlationId: `bulk_map_${targetTenant.slug}_${Date.now()}`,
      afterState: {
        assignedCount,
        targetTenantSlug: targetTenant.slug,
        targetTenantName: targetTenant.displayName || targetTenant.name,
      },
    });

    return res.json({
      success: true,
      message: `Successfully assigned ${assignedCount} device(s) to ${targetTenant.displayName || targetTenant.name} (${targetTenant.slug})`,
      assignedCount,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/superadmin/pending-mappings/:id/ignore
 * Mark a pending mapping as IGNORED
 */
superAdminRouter.post('/pending-mappings/:id/ignore', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const pending = await PendingDeviceMapping.findByIdAndUpdate(
      id,
      { $set: { status: 'IGNORED', mappedBy: req.user!.id, mappedAt: new Date() } },
      { new: true }
    );
    if (!pending) return res.status(404).json({ success: false, error: 'Record not found' });
    return res.json({ success: true, message: `Device ${pending.serialNumber} marked as IGNORED`, pending });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /api/superadmin/pending-mappings/:id
 * Delete a pending mapping record
 */
superAdminRouter.delete('/pending-mappings/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    await PendingDeviceMapping.findByIdAndDelete(id);
    return res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/superadmin/settings/alerts
 * Get Super Admin alert configuration
 */
superAdminRouter.get('/settings/alerts', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const alerts = dataStore.getSettings();
    return res.json({ success: true, settings: alerts });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/superadmin/settings/alerts
 * Update Super Admin alert preferences
 */
superAdminRouter.put('/settings/alerts', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updated = dataStore.updateSettings(req.body);
    return res.json({ success: true, settings: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/superadmin/settings/alerts/test-whatsapp
 * Dispatches an instant test WhatsApp alert to the configured Super Admin phone
 */
superAdminRouter.post('/settings/alerts/test-whatsapp', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { phone } = req.body;
    const targetPhone = phone || (await SystemSetting.findOne({ key: 'global_config' }))?.superAdminAlerts?.recipientPhone;

    if (!targetPhone) {
      return res.status(400).json({ success: false, error: 'Super Admin recipient WhatsApp phone number is required' });
    }

    const cleanHost = ((req.headers['x-forwarded-host'] as string) || (req.headers['host'] as string) || 'localhost').split(':')[0];
    const testPayload = {
      serialNumber: `TEST-ONT-${Math.floor(100000 + Math.random() * 900000)}`,
      manufacturer: 'GENEXIS / Syrotech (Test)',
      oui: '002207',
      productClass: 'Titanium-2122A',
      incomingHost: `${cleanHost}:7547`,
      incomingUrl: '/tr069',
      reason: 'MISSING_SLUG_AND_SUBDOMAIN (Test Alert)',
      clientIp: req.ip || '127.0.0.1',
    };

    const formattedTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
    const alertMessage =
      `🧪 *AI ISP OS — Super Admin WhatsApp Alert Test*\n\n` +
      `This is a verified test notification confirming your Super Admin alert channel is active!\n\n` +
      `📟 *Sample Serial:* \`${testPayload.serialNumber}\`\n` +
      `🏷️ *Model:* ${testPayload.productClass}\n` +
      `🌐 *Host:* ${testPayload.incomingHost}\n` +
      `❗ *Reason Code:* \`${testPayload.reason}\`\n` +
      `🕒 *Timestamp:* ${formattedTime} IST\n\n` +
      `👉 *Manage Devices:* http://localhost:3000/superadmin/pending-mappings\n\n` +
      `🛡️ _AI ISP OS Multi-Tenant TR-069 Controller_`;

    const result = await WhatsAppService.sendTestMessage(targetPhone, alertMessage);

    return res.json({
      success: true,
      message: `Test alert dispatched to Super Admin mobile [${targetPhone}]`,
      messageId: result.messageId,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});
