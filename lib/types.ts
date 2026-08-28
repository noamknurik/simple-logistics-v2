export type OrgRole = 'admin' | 'warehouse';
export type OrderStatus = 'pending' | 'documented' | 'shipped';
export type PhotoType = 'full_package' | 'box_seal' | 'package_contents' | 'shipping_label' | 'other';

export interface Org {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string;
  secondary_color: string;
  show_powered_by: boolean;
  photo_retention_days: number | null;
  created_at: string;
}

export interface OrgMember {
  id: string;
  org_id: string;
  user_id: string;
  role: OrgRole;
  full_name: string | null;
  employee_id: string | null;
  is_active: boolean;
  notification_prefs: { new_order_assigned: boolean; daily_summary: boolean };
  created_at: string;
}

export interface OrderItem {
  name: string;
  sku: string;
  qty: number;
}

export interface Order {
  id: string;
  org_id: string;
  order_number: string;
  customer_name: string | null;
  reference: string | null;
  ship_to_name: string | null;
  ship_to_address: string | null;
  items: OrderItem[];
  status: OrderStatus;
  carrier: string | null;
  tracking_number: string | null;
  notes: string | null;
  imported_from: string | null;
  documented_by: string | null;
  documented_at: string | null;
  shipped_at: string | null;
  created_at: string;
}

export interface OrderPhoto {
  id: string;
  order_id: string;
  org_id: string;
  photo_type: PhotoType;
  photo_url: string;
  uploaded_by: string | null;
  created_at: string;
}

export interface OrderSummaryRow {
  id: string;
  org_id: string;
  order_number: string;
  customer_name: string | null;
  status: OrderStatus;
  documented_by: string | null;
  documented_at: string | null;
  shipped_at: string | null;
  created_at: string;
  photo_count: number;
}

export const REQUIRED_PHOTO_TYPES: { type: PhotoType; label: string; helper: string }[] = [
  { type: 'full_package', label: 'Full Package', helper: 'Photo of the complete package and all sides.' },
  { type: 'box_seal', label: 'Box Seal', helper: 'Close-up of all tape seals on the package.' },
  { type: 'package_contents', label: 'Package Contents', helper: 'Open the package and show all contents clearly.' },
  { type: 'shipping_label', label: 'Shipping Label', helper: 'Clear photo of the shipping label with tracking number.' },
];
