import { useState } from 'react'
import {
  Settings, Building2, Bell, Shield, Palette,
  Save, Globe, Clock, FileText, CheckCircle
} from 'lucide-react'
import { Input, Textarea } from '../components/ui/Input'
import { Button } from '../components/ui/Button'
import { Card, CardHeader, CardBody } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { cn } from '../lib/utils'

type SettingsTab = 'company' | 'notifications' | 'security' | 'documents' | 'appearance'

const TABS: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { key: 'company', label: 'Company', icon: <Building2 className="w-4 h-4" /> },
  { key: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
  { key: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { key: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
  { key: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
]

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={cn(
        'relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0',
        checked ? 'bg-blue-600' : 'bg-slate-300'
      )}
    >
      <span className={cn(
        'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
        checked ? 'translate-x-4.5' : 'translate-x-0.5'
      )} style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }} />
    </button>
  )
}

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('company')
  const [saved, setSaved] = useState(false)

  // Company settings
  const [company, setCompany] = useState({
    name: 'BuildFlow Construction Ltd',
    email: 'info@buildflow.rw',
    phone: '+250 788 000 001',
    address: 'KG 11 Ave, Kiyovu, Kigali, Rwanda',
    website: 'www.buildflow.rw',
    description: 'A leading construction management company in Rwanda specialising in residential, commercial, and infrastructure projects.',
    timezone: 'Africa/Kigali',
  })

  // Notification settings
  const [notifSettings, setNotifSettings] = useState({
    emailOnUpload: true,
    emailOnReview: true,
    emailOnApproval: true,
    emailOnRejection: true,
    emailOnOverdue: true,
    inAppAll: true,
    dailyDigest: false,
    weeklyReport: true,
  })

  // Document settings
  const [docSettings, setDocSettings] = useState({
    requireReviewBeforeApproval: true,
    autoNumberDocuments: true,
    allowExternalSharing: false,
    maxFileSizeMB: '100',
    defaultRevisionStart: 'A',
    requireDescriptionOnUpload: false,
    watermarkApprovedDocs: true,
  })

  // Security
  const [secSettings, setSecSettings] = useState({
    enforceStrongPasswords: true,
    sessionTimeoutMinutes: '60',
    twoFactorRequired: false,
    ipWhitelisting: false,
    auditAllDownloads: true,
  })

  async function handleSave() {
    await new Promise(r => setTimeout(r, 400))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Settings</h2>
          <p className="text-sm text-slate-500">Manage company-wide platform configuration</p>
        </div>
        <Button
          icon={saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          onClick={handleSave}
          variant={saved ? 'secondary' : 'primary'}
        >
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
      </div>

      <div className="flex gap-5">
        {/* Sidebar nav */}
        <div className="w-44 shrink-0">
          <nav className="space-y-0.5">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  activeTab === tab.key
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">

          {/* Company */}
          {activeTab === 'company' && (
            <Card>
              <CardHeader><h3 className="text-sm font-semibold text-slate-800">Company Profile</h3></CardHeader>
              <CardBody className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Company Name" value={company.name} onChange={e => setCompany(c => ({ ...c, name: e.target.value }))} className="col-span-2" />
                  <Input label="Email" type="email" value={company.email} onChange={e => setCompany(c => ({ ...c, email: e.target.value }))} />
                  <Input label="Phone" value={company.phone} onChange={e => setCompany(c => ({ ...c, phone: e.target.value }))} />
                  <Input label="Website" value={company.website} onChange={e => setCompany(c => ({ ...c, website: e.target.value }))} />
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Timezone</label>
                    <select value={company.timezone} onChange={e => setCompany(c => ({ ...c, timezone: e.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="Africa/Kigali">Africa/Kigali (UTC+2)</option>
                      <option value="UTC">UTC</option>
                      <option value="Europe/London">Europe/London</option>
                    </select>
                  </div>
                  <Textarea label="Address" value={company.address} onChange={e => setCompany(c => ({ ...c, address: e.target.value }))} rows={2} className="col-span-2" />
                  <Textarea label="Description" value={company.description} onChange={e => setCompany(c => ({ ...c, description: e.target.value }))} rows={3} className="col-span-2" />
                </div>
              </CardBody>
            </Card>
          )}

          {/* Documents */}
          {activeTab === 'documents' && (
            <Card>
              <CardHeader><h3 className="text-sm font-semibold text-slate-800">Document Workflow Settings</h3></CardHeader>
              <CardBody className="space-y-4">
                {[
                  { key: 'requireReviewBeforeApproval', label: 'Require review before approval', desc: 'Documents must go through a formal review step before they can be approved.' },
                  { key: 'autoNumberDocuments', label: 'Auto-generate document numbers', desc: 'Automatically assign document numbers using the project code and discipline.' },
                  { key: 'allowExternalSharing', label: 'Allow external document sharing', desc: 'Users can generate shareable links for external stakeholders.' },
                  { key: 'requireDescriptionOnUpload', label: 'Require description on upload', desc: 'Uploaders must provide a description when submitting a new document.' },
                  { key: 'watermarkApprovedDocs', label: 'Watermark approved documents', desc: 'Apply a company watermark to approved PDFs when downloaded.' },
                ].map(s => (
                  <div key={s.key} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{s.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
                    </div>
                    <ToggleSwitch
                      checked={docSettings[s.key as keyof typeof docSettings] as boolean}
                      onChange={() => setDocSettings(d => ({ ...d, [s.key]: !d[s.key as keyof typeof docSettings] }))}
                    />
                  </div>
                ))}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <Input label="Max file size (MB)" type="number" value={docSettings.maxFileSizeMB} onChange={e => setDocSettings(d => ({ ...d, maxFileSizeMB: e.target.value }))} />
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-slate-700">Default revision start</label>
                    <select value={docSettings.defaultRevisionStart} onChange={e => setDocSettings(d => ({ ...d, defaultRevisionStart: e.target.value }))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="A">A</option>
                      <option value="0">0</option>
                      <option value="00">00</option>
                      <option value="P1">P1</option>
                    </select>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader><h3 className="text-sm font-semibold text-slate-800">Notification Preferences</h3></CardHeader>
              <CardBody className="space-y-4">
                <p className="text-xs text-slate-500">Configure when the platform sends email and in-app notifications.</p>
                {[
                  { key: 'emailOnUpload', label: 'Email on document upload', desc: 'Notify relevant users when a new document is uploaded.' },
                  { key: 'emailOnReview', label: 'Email on review assignment', desc: 'Notify reviewers when a document is assigned to them.' },
                  { key: 'emailOnApproval', label: 'Email on document approval', desc: 'Notify the uploader when their document is approved.' },
                  { key: 'emailOnRejection', label: 'Email on document rejection', desc: 'Notify the uploader when their document is returned with comments.' },
                  { key: 'emailOnOverdue', label: 'Email on overdue reviews', desc: 'Send reminders when review deadlines are missed.' },
                  { key: 'inAppAll', label: 'In-app notifications', desc: 'Show notifications in the platform for all document events.' },
                  { key: 'weeklyReport', label: 'Weekly summary report', desc: 'Email a weekly digest of document and project activity.' },
                  { key: 'dailyDigest', label: 'Daily digest email', desc: 'Email a daily summary of pending actions.' },
                ].map(s => (
                  <div key={s.key} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{s.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
                    </div>
                    <ToggleSwitch
                      checked={notifSettings[s.key as keyof typeof notifSettings]}
                      onChange={() => setNotifSettings(n => ({ ...n, [s.key]: !n[s.key as keyof typeof notifSettings] }))}
                    />
                  </div>
                ))}
              </CardBody>
            </Card>
          )}

          {/* Security */}
          {activeTab === 'security' && (
            <div className="space-y-4">
              <Card>
                <CardHeader><h3 className="text-sm font-semibold text-slate-800">Security Settings</h3></CardHeader>
                <CardBody className="space-y-4">
                  {[
                    { key: 'enforceStrongPasswords', label: 'Enforce strong passwords', desc: 'Require passwords to have at least 8 characters, uppercase, numbers, and symbols.' },
                    { key: 'twoFactorRequired', label: 'Require 2FA for all users', desc: 'All users must set up two-factor authentication to access the platform.' },
                    { key: 'ipWhitelisting', label: 'IP whitelisting', desc: 'Only allow access from specific IP addresses (configure below).' },
                    { key: 'auditAllDownloads', label: 'Audit all downloads', desc: 'Log every document download with user, timestamp, and IP address.' },
                  ].map(s => (
                    <div key={s.key} className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{s.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{s.desc}</p>
                      </div>
                      <ToggleSwitch
                        checked={secSettings[s.key as keyof typeof secSettings] as boolean}
                        onChange={() => setSecSettings(s2 => ({ ...s2, [s.key]: !s2[s.key as keyof typeof secSettings] }))}
                      />
                    </div>
                  ))}
                  <div className="pt-2 border-t border-slate-100">
                    <Input
                      label="Session timeout (minutes)"
                      type="number"
                      value={secSettings.sessionTimeoutMinutes}
                      onChange={e => setSecSettings(s => ({ ...s, sessionTimeoutMinutes: e.target.value }))}
                      className="w-40"
                    />
                  </div>
                </CardBody>
              </Card>
              <Card className="border-amber-100 bg-amber-50">
                <CardBody>
                  <p className="text-sm text-amber-800 font-medium">Security Notice</p>
                  <p className="text-xs text-amber-700 mt-1">
                    This is a demo system. In production, all security settings would be enforced at the server level,
                    not the browser. Passwords are hashed, sessions use JWT tokens, and all actions are audit-logged.
                  </p>
                </CardBody>
              </Card>
            </div>
          )}

          {/* Appearance */}
          {activeTab === 'appearance' && (
            <Card>
              <CardHeader><h3 className="text-sm font-semibold text-slate-800">Appearance & Branding</h3></CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-slate-800 mb-2">Theme</p>
                  <div className="flex gap-3">
                    {['Light', 'Dark', 'System'].map(theme => (
                      <button
                        key={theme}
                        className={cn(
                          'px-4 py-2 rounded-lg border text-sm font-medium transition-colors',
                          theme === 'Light'
                            ? 'bg-blue-50 border-blue-300 text-blue-700'
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        )}
                      >
                        {theme}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 mb-2">Accent Colour</p>
                  <div className="flex gap-2">
                    {['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#0ea5e9'].map(color => (
                      <button
                        key={color}
                        className={cn('w-7 h-7 rounded-full border-2 transition-transform hover:scale-110', color === '#3b82f6' && 'border-slate-700')}
                        style={{ background: color, borderColor: color === '#3b82f6' ? '#1e293b' : 'transparent' }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 mb-1">Date Format</p>
                  <select className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option>DD MMM YYYY (12 Oct 2024)</option>
                    <option>MM/DD/YYYY (10/12/2024)</option>
                    <option>YYYY-MM-DD (2024-10-12)</option>
                  </select>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
