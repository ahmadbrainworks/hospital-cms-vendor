# Phase 3 Component Library - Usage Guide

## Quick Start

All components are exported from `@/components/ui`:

```tsx
import {
  Button,
  Input,
  Modal,
  Card,
  Table,
  Alert,
  Badge,
  // ... others
} from "@/components/ui";
```

---

## Form Components

### Button

```tsx
import { Button } from "@/components/ui";

// Basic
<Button>Click me</Button>

// Variants: primary (default), secondary, ghost, danger, success
<Button variant="danger">Delete</Button>

// Sizes: xs, sm, md (default), lg, xl
<Button size="lg">Large button</Button>

// Loading state
<Button isLoading>Saving...</Button>

// With icon
<Button icon={<SaveIcon />}>Save</Button>

// Full width
<Button fullWidth>Submit form</Button>
```

### Input

```tsx
import { Input } from "@/components/ui";

const [value, setValue] = useState("");
const [error, setError] = useState("");

// Basic
<Input
  placeholder="Enter text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// With label
<Input label="Email" type="email" placeholder="you@example.com" />

// With error
<Input
  label="Password"
  type="password"
  error={error}
  helperText="Min 8 characters"
/>

// With icon
<Input
  label="Search"
  icon={<SearchIcon />}
  placeholder="Search..."
/>
```

### Select

```tsx
import { Select } from "@/components/ui";

<Select
  label="Status"
  options={[
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
  ]}
  placeholder="Select status"
  onChange={(e) => console.log(e.target.value)}
/>
```

### Textarea

```tsx
import { Textarea } from "@/components/ui";

<Textarea
  label="Description"
  placeholder="Enter description..."
  characterLimit={500}
  helperText="Max 500 characters"
/>
```

### Checkbox

```tsx
import { Checkbox } from "@/components/ui";

<Checkbox
  id="agree"
  label="I agree to terms"
  helperText="Read our terms carefully"
  onChange={(e) => console.log(e.target.checked)}
/>
```

---

## Layout Components

### Card

```tsx
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui";

// Simple card
<Card padding="md">
  Content here
</Card>

// Hoverable card
<Card hoverable onClick={() => console.log("clicked")}>
  Clickable card
</Card>

// Compound pattern
<Card>
  <CardHeader>
    <h2 className="text-lg font-bold">Title</h2>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Modal

```tsx
import { Modal, Button } from "@/components/ui";
import { useState } from "react";

export function Example() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      <Modal
        isOpen={isOpen}
        title="Confirm action"
        onClose={() => setIsOpen(false)}
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={() => setIsOpen(false)}>
              Confirm
            </Button>
          </>
        }
      >
        <p>Are you sure you want to proceed?</p>
      </Modal>
    </>
  );
}
```

### Sidebar

```tsx
import { Sidebar } from "@/components/ui";
import { Home, Users, Settings } from "lucide-react";

const items = [
  {
    id: "home",
    label: "Home",
    icon: <Home size={18} />,
    active: true,
  },
  {
    id: "patients",
    label: "Patients",
    icon: <Users size={18} />,
    children: [
      { id: "list", label: "Patient List" },
      { id: "add", label: "Add Patient" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings size={18} />,
  },
];

<Sidebar
  items={items}
  title="Hospital CMS"
  onNavigate={(id) => console.log("Navigate to", id)}
/>
```

### Topbar

```tsx
import { Topbar, Button } from "@/components/ui";
import { Bell } from "lucide-react";

<Topbar
  title="Dashboard"
  subtitle="Welcome back!"
  rightSlot={<Bell size={20} />}
  actions={<Button size="sm">New Record</Button>}
/>
```

---

## Data Display

### Table

```tsx
import { Table } from "@/components/ui";

const columns = [
  { key: "name", label: "Name", width: "250px" },
  { key: "email", label: "Email", sortable: true },
  { key: "status", label: "Status" },
];

const rows = [
  {
    name: "John Doe",
    email: "john@example.com",
    status: <Badge variant="success">Active</Badge>,
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    status: <Badge variant="warning">Pending</Badge>,
  },
];

<Table
  columns={columns}
  rows={rows}
  hoverable
  loading={false}
  emptyState={<p>No data found</p>}
/>
```

### Tabs

```tsx
import { Tabs } from "@/components/ui";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "details", label: "Details" },
  { id: "history", label: "History", badge: <Badge>3</Badge> },
];

<Tabs tabs={tabs} defaultTab="overview">
  {(tabId) => {
    if (tabId === "overview") return <div>Overview content</div>;
    if (tabId === "details") return <div>Details content</div>;
    return <div>History content</div>;
  }}
</Tabs>
```

### Dropdown

```tsx
import { Dropdown, Button } from "@/components/ui";
import { MoreVertical, Edit, Trash } from "lucide-react";

<Dropdown
  trigger={<Button variant="ghost"><MoreVertical size={18} /></Button>}
  items={[
    {
      id: "edit",
      label: "Edit",
      icon: <Edit size={16} />,
      onClick: () => console.log("Edit"),
    },
    {
      id: "delete",
      label: "Delete",
      icon: <Trash size={16} />,
      variant: "danger",
      onClick: () => console.log("Delete"),
    },
  ]}
/>
```

---

## Feedback Components

### Alert

```tsx
import { Alert } from "@/components/ui";

// Variants: info, success, warning, error
<Alert variant="success" title="Success!">
  Your changes have been saved.
</Alert>

// Dismissible
<Alert
  variant="warning"
  dismissible
  onClose={() => console.log("dismissed")}
>
  This is a dismissible alert.
</Alert>
```

### Toast

```tsx
// Use with a toast container (future implementation)
// This is typically managed by a toast context/hook

import { Toast } from "@/components/ui";

<Toast
  id="toast-1"
  message="Operation completed successfully"
  variant="success"
  onClose={(id) => console.log("remove", id)}
  action={{
    label: "Undo",
    onClick: () => console.log("undo"),
  }}
/>
```

### Badge

```tsx
import { Badge } from "@/components/ui";

// Variants: default, primary, success, warning, error, info
<Badge variant="primary">Active</Badge>

// With pulse animation (for status)
<Badge variant="success" pulse>
  Connected
</Badge>

// Size
<Badge size="md">Large Badge</Badge>
```

### Skeleton

```tsx
import { Skeleton, SkeletonGroup } from "@/components/ui";

// Single skeleton
<Skeleton width="100%" height={20} />
<Skeleton width={200} variant="circle" height={200} />

// Group
<SkeletonGroup count={3} />

// Custom group
<SkeletonGroup count={5}>
  {(i) => (
    <div key={i} className="flex gap-3">
      <Skeleton width={40} height={40} variant="circle" />
      <div className="flex-1">
        <Skeleton width="80%" />
      </div>
    </div>
  )}
</SkeletonGroup>
```

---

## Motion System

All components use the unified motion system. Access it directly:

```tsx
import { MOTION, getTransition } from "@/components/ui";

// Use motion timing
const duration = MOTION.duration.standard; // 250ms

// Get transition string
const transition = getTransition(
  ["background-color", "color"],
  "standard",
  "ease_out"
);

// Apply to custom element
<div
  style={{ transition }}
  className="hover:bg-primary-600"
>
  Custom element
</div>
```

---

## Best Practices

### 1. Use Compound Patterns
```tsx
// ✅ Good
<Card>
  <CardHeader><h2>Title</h2></CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter><Button>Action</Button></CardFooter>
</Card>

// ❌ Avoid (less semantic)
<div className="border p-4">
  <div className="border-b pb-4"><h2>Title</h2></div>
  <div>Content</div>
  <div className="border-t pt-4"><Button>Action</Button></div>
</div>
```

### 2. Leverage TypeScript
```tsx
// ✅ Type-safe variant usage
<Button variant="primary" />  // ✅
<Button variant="invalid" />  // ❌ TS error

// ✅ Proper event typing
<Input
  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
  }}
/>
```

### 3. Handle Loading & Error States
```tsx
// ✅ Complete UX
<form onSubmit={handleSubmit}>
  <Input
    label="Name"
    error={errors.name}
    disabled={isLoading}
  />
  <Button isLoading={isLoading} disabled={isLoading}>
    {isLoading ? "Saving" : "Save"}
  </Button>
</form>
```

### 4. Accessibility First
```tsx
// ✅ Always include labels
<Input label="Email" type="email" />

// ✅ Use semantic elements
<nav><Sidebar /></nav>

// ✅ Keyboard navigation works
<Modal isOpen={isOpen} onClose={onClose}>
  {/* Escape and focus trap work automatically */}
</Modal>
```

### 5. Responsive Design
```tsx
// ✅ Sidebar is responsive
<Sidebar
  defaultCollapsed={false}
  // Automatically hides on mobile, shows on md+
/>

// ✅ Use Tailwind responsive classes
<Button className="w-full md:w-auto">
  Responsive width
</Button>
```

---

## Customization

All components accept `className` prop for custom styles:

```tsx
<Button className="font-mono uppercase">
  Custom styled button
</Button>

<Card className="border-2 border-error-500">
  Custom card
</Card>
```

Leverage the exported utilities:

```tsx
import { cx, buttonVariants } from "@/components/ui";

// Compose classnames
const className = cx(
  "base-styles",
  isActive && "active-styles",
  isDisabled && "disabled-styles"
);

// Use variant styles directly
const style = buttonVariants.primary; // "bg-primary-600 text-white ..."
```

---

## Common Patterns

### Loading a Form
```tsx
<Form onSubmit={handleSubmit}>
  <Input label="Email" disabled={isLoading} />
  <Input label="Password" type="password" disabled={isLoading} />
  <Button isLoading={isLoading}>
    {isLoading ? "Submitting" : "Submit"}
  </Button>
</Form>
```

### Confirmation Modal
```tsx
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  title="Delete item?"
  onClose={() => setIsOpen(false)}
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="danger" onClick={handleDelete}>
        Delete
      </Button>
    </>
  }
>
  This action cannot be undone.
</Modal>
```

### Empty State
```tsx
<Table
  columns={columns}
  rows={data}
  emptyState={
    <div className="text-center py-8">
      <AlertCircle className="w-12 h-12 mx-auto text-neutral-500 mb-3" />
      <p className="text-neutral-400">No data available</p>
      <Button size="sm" className="mt-4">New Record</Button>
    </div>
  }
/>
```

---

## TypeScript Types

```tsx
// Importing types
import type { ButtonProps, InputProps, ModalProps } from "@/components/ui";

// Custom component
interface FormProps {
  onSubmit: (data: FormData) => void;
}

export function MyForm({ onSubmit }: FormProps) {
  // ...
}
```

---

## Animation Timing Reference

- **Micro (150ms):** Focus rings, state changes
- **Standard (250ms):** Transitions, modal fade
- **Macro (400ms):** Page transitions, major layout changes

All animations respect `prefers-reduced-motion` preference.
