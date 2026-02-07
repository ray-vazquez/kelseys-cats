# Phase 3: Component Polish Guide

**Created:** February 6, 2026, 10:28 PM EST

This guide covers the interactive components added in Phase 3 to enhance user experience with notifications, dialogs, and contextual help.

---

## Overview

Phase 3 adds professional interactive components:

1. **Toast Notifications** - Non-intrusive user feedback
2. **Modal Dialogs** - Focused user interactions
3. **Tooltips** - Contextual help and information

---

## 1. Toast Notifications

### Purpose
Provide non-intrusive feedback for user actions (success, errors, warnings, info).

### Component Location
`frontend/src/components/Common/Toast.jsx`

### Features
- ✅ 4 variants (success, error, warning, info)
- ✅ Auto-dismiss with configurable duration
- ✅ Progress bar animation
- ✅ Slide-in/slide-out animations
- ✅ Manual close button
- ✅ Responsive (stacks vertically)
- ✅ ARIA live regions for accessibility

### Basic Usage

```jsx
import { Toast } from '../components/Common/Toast';

// Success notification
<Toast
  title="Success!"
  message="Cat profile updated successfully."
  variant="success"
  duration={5000}
  onClose={() => console.log('Toast closed')}
/>

// Error notification
<Toast
  title="Error"
  message="Failed to save changes. Please try again."
  variant="error"
  duration={0} // Won't auto-dismiss
  onClose={handleClose}
/>

// Warning
<Toast
  title="Warning"
  message="This action cannot be undone."
  variant="warning"
/>

// Info
<Toast
  title="New feature available"
  message="Check out the new alumni page!"
  variant="info"
/>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | string | - | Toast title (optional) |
| `message` | string | - | Toast message (optional) |
| `variant` | 'success' \| 'error' \| 'warning' \| 'info' | 'info' | Visual style |
| `duration` | number | 5000 | Auto-dismiss time (ms), 0 = never |
| `onClose` | function | - | Close callback |
| `showProgress` | boolean | true | Show progress bar |
| `isClosing` | boolean | false | Trigger close animation |

### Using ToastProvider

For managing multiple toasts:

```jsx
import ToastProvider, { Toast } from '../components/Common/Toast';

function App() {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, ...toast, onClose: () => removeToast(id) }]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastProvider toasts={toasts}>
      {/* Your app */}
      <button onClick={() => addToast({
        title: 'Success',
        message: 'Action completed',
        variant: 'success'
      })}>
        Show Toast
      </button>
    </ToastProvider>
  );
}
```

### Real-World Examples

**Form Submission:**
```jsx
const handleSubmit = async (data) => {
  try {
    await saveCat(data);
    addToast({
      title: 'Success!',
      message: `${data.name} has been added.`,
      variant: 'success'
    });
  } catch (error) {
    addToast({
      title: 'Error',
      message: error.message || 'Failed to save cat',
      variant: 'error',
      duration: 0 // Keep until manually closed
    });
  }
};
```

**Adoption Status Update:**
```jsx
const handleAdoption = async (catId) => {
  addToast({
    title: 'Processing...',
    message: 'Updating adoption status',
    variant: 'info'
  });
  
  try {
    await updateCatStatus(catId, 'adopted');
    addToast({
      title: '🎉 Congratulations!',
      message: 'Cat marked as adopted. Thank you!',
      variant: 'success'
    });
  } catch (error) {
    addToast({
      title: 'Update failed',
      message: 'Could not update status',
      variant: 'error'
    });
  }
};
```

---

## 2. Modal Dialogs

### Purpose
Create focused interactions that require user attention or confirmation.

### Component Location
`frontend/src/components/Common/Modal.jsx`

### Features
- ✅ 5 size variants (sm, md, lg, xl, full)
- ✅ Backdrop with blur effect
- ✅ Slide-up animation
- ✅ Focus management
- ✅ Escape key to close
- ✅ Click outside to close (optional)
- ✅ Prevents body scroll
- ✅ Returns focus on close
- ✅ Responsive (full-width on mobile)
- ✅ Custom scrollbar

### Basic Usage

```jsx
import Modal from '../components/Common/Modal';
import { Button } from '../components/Common/StyledComponents';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Modal Title"
        footer={
          <>
            <Button $variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button $variant="primary" onClick={handleSave}>
              Save
            </Button>
          </>
        }
      >
        <p>Modal content goes here...</p>
      </Modal>
    </>
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | **required** | Modal visibility |
| `onClose` | function | **required** | Close callback |
| `title` | string | - | Modal title |
| `children` | node | **required** | Modal body content |
| `footer` | node | - | Footer content (buttons) |
| `size` | 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full' | 'md' | Modal width |
| `showCloseButton` | boolean | true | Show X button |
| `closeOnOverlayClick` | boolean | true | Close on backdrop click |
| `closeOnEscape` | boolean | true | Close on ESC key |

### ConfirmModal Variant

For quick confirmation dialogs:

```jsx
import { ConfirmModal } from '../components/Common/Modal';

function DeleteCat({ catId, catName }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteCat(catId);
      setShowConfirm(false);
      // Show success toast
    } catch (error) {
      // Show error toast
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button $variant="danger" onClick={() => setShowConfirm(true)}>
        Delete
      </Button>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Cat Profile"
        message={`Are you sure you want to delete ${catName}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}
```

### Real-World Examples

**Cat Profile Editor:**
```jsx
function EditCatModal({ cat, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState(cat);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      // Handle error
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit ${cat.name}`}
      size="lg"
      footer={
        <>
          <Button $variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button $variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </>
      }
    >
      {/* Form fields */}
      <FormGroup>
        <Label>Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
      </FormGroup>
      {/* More fields... */}
    </Modal>
  );
}
```

**Image Gallery:**
```jsx
function ImageGalleryModal({ images, isOpen, onClose, initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      showCloseButton
    >
      <div style={{ textAlign: 'center' }}>
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          style={{ maxWidth: '100%', maxHeight: '70vh' }}
        />
        <div style={{ marginTop: '1rem' }}>
          <Button
            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >
            Previous
          </Button>
          <span style={{ margin: '0 1rem' }}>
            {currentIndex + 1} / {images.length}
          </span>
          <Button
            onClick={() => setCurrentIndex(i => Math.min(images.length - 1, i + 1))}
            disabled={currentIndex === images.length - 1}
          >
            Next
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

---

## 3. Tooltips

### Purpose
Provide contextual help and additional information without cluttering the UI.

### Component Location
`frontend/src/components/Common/Tooltip.jsx`

### Features
- ✅ 4 placement options (top, bottom, left, right)
- ✅ Configurable delay
- ✅ Automatic arrow positioning
- ✅ Keyboard accessible (focus/blur)
- ✅ Multi-line support
- ✅ Can be disabled

### Basic Usage

```jsx
import Tooltip from '../components/Common/Tooltip';
import { Badge } from '../components/Common/StyledComponents';

// Simple tooltip
<Tooltip content="This cat needs special dietary care">
  <Badge $variant="warning">Special Needs</Badge>
</Tooltip>

// Different placements
<Tooltip content="Click to edit" placement="top">
  <Button>Edit</Button>
</Tooltip>

<Tooltip content="More information available" placement="right">
  <span>ℹ️</span>
</Tooltip>

// With delay
<Tooltip content="Hover for 500ms to see this" delay={500}>
  <span>Slow tooltip</span>
</Tooltip>

// Disabled
<Tooltip content="Won't show" disabled={true}>
  <span>No tooltip</span>
</Tooltip>
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | node | **required** | Element to attach tooltip to |
| `content` | node | - | Tooltip content |
| `placement` | 'top' \| 'bottom' \| 'left' \| 'right' | 'top' | Position |
| `delay` | number | 200 | Show delay (ms) |
| `offset` | number | 8 | Distance from element (px) |
| `disabled` | boolean | false | Disable tooltip |

### Real-World Examples

**Badge Explanations:**
```jsx
<BadgeGroup>
  <Tooltip content="This cat requires special medical attention or diet">
    <Badge $variant="warning">Special Needs</Badge>
  </Tooltip>
  
  <Tooltip content="Must be adopted together with another cat">
    <Badge $variant="info">Bonded Pair</Badge>
  </Tooltip>
  
  <Tooltip content="Cat is 10+ years old">
    <Badge $variant="secondary">Senior</Badge>
  </Tooltip>
</BadgeGroup>
```

**Form Field Help:**
```jsx
<FormGroup>
  <Label>
    Temperament
    <Tooltip
      content="Describe the cat's personality, energy level, and behavior"
      placement="right"
    >
      <span style={{ marginLeft: '0.5rem', cursor: 'help' }}>ℹ️</span>
    </Tooltip>
  </Label>
  <Textarea />
</FormGroup>
```

**Icon Buttons:**
```jsx
<Tooltip content="Mark as adopted">
  <Button $variant="success" $size="sm" onClick={handleAdopt}>
    ✓
  </Button>
</Tooltip>

<Tooltip content="Delete cat profile" placement="left">
  <Button $variant="danger" $size="sm" onClick={handleDelete}>
    🗑️
  </Button>
</Tooltip>
```

**Conditional Tooltips:**
```jsx
<Tooltip
  content={cat.is_special_needs ? "Requires special care" : ""}
  disabled={!cat.is_special_needs}
>
  <span>{cat.name}</span>
</Tooltip>
```

---

## Integration Examples

### Complete Cat Management Page

```jsx
import React, { useState } from 'react';
import Modal, { ConfirmModal } from '../components/Common/Modal';
import ToastProvider from '../components/Common/Toast';
import Tooltip from '../components/Common/Tooltip';
import {
  Button,
  Badge,
  Card,
  CardBody,
  CardTitle
} from '../components/Common/StyledComponents';

function CatManagementPage() {
  const [toasts, setToasts] = useState([]);
  const [editModal, setEditModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const addToast = (toast) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, {
      id,
      ...toast,
      onClose: () => setToasts(prev => prev.filter(t => t.id !== id))
    }]);
  };

  const handleEdit = (cat) => {
    setEditModal(cat);
  };

  const handleSave = async (cat) => {
    try {
      await saveCat(cat);
      setEditModal(null);
      addToast({
        title: 'Success!',
        message: `${cat.name} updated successfully`,
        variant: 'success'
      });
    } catch (error) {
      addToast({
        title: 'Error',
        message: 'Failed to save changes',
        variant: 'error'
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCat(deleteConfirm.id);
      setDeleteConfirm(null);
      addToast({
        title: 'Deleted',
        message: 'Cat profile removed',
        variant: 'info'
      });
    } catch (error) {
      addToast({
        title: 'Error',
        message: 'Failed to delete',
        variant: 'error'
      });
    }
  };

  return (
    <ToastProvider toasts={toasts}>
      <div>
        {cats.map(cat => (
          <Card key={cat.id}>
            <CardBody>
              <CardTitle>{cat.name}</CardTitle>
              
              <div>
                <Tooltip content="This cat needs special care">
                  <Badge $variant="warning">Special Needs</Badge>
                </Tooltip>
              </div>

              <div>
                <Tooltip content="Edit cat profile">
                  <Button $size="sm" onClick={() => handleEdit(cat)}>
                    Edit
                  </Button>
                </Tooltip>
                
                <Tooltip content="Delete cat profile" placement="left">
                  <Button
                    $variant="danger"
                    $size="sm"
                    onClick={() => setDeleteConfirm(cat)}
                  >
                    Delete
                  </Button>
                </Tooltip>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      {editModal && (
        <Modal
          isOpen={!!editModal}
          onClose={() => setEditModal(null)}
          title={`Edit ${editModal.name}`}
          footer={
            <>
              <Button $variant="outline" onClick={() => setEditModal(null)}>
                Cancel
              </Button>
              <Button $variant="primary" onClick={() => handleSave(editModal)}>
                Save
              </Button>
            </>
          }
        >
          {/* Edit form */}
        </Modal>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <ConfirmModal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDelete}
          title="Delete Cat"
          message={`Are you sure you want to delete ${deleteConfirm.name}?`}
          confirmText="Delete"
          variant="danger"
        />
      )}
    </ToastProvider>
  );
}
```

---

## Best Practices

### Toast Notifications

**Do:**
- ✅ Use success for completed actions
- ✅ Use error for failures (keep visible until dismissed)
- ✅ Use warning for cautions
- ✅ Use info for neutral updates
- ✅ Keep messages concise
- ✅ Provide actionable information in errors

**Don't:**
- ❌ Show multiple toasts for the same action
- ❌ Use toasts for critical errors (use modals)
- ❌ Make success messages too long
- ❌ Auto-dismiss error messages quickly

### Modal Dialogs

**Do:**
- ✅ Use for actions requiring focus
- ✅ Provide clear close options
- ✅ Use appropriate size for content
- ✅ Keep content scrollable
- ✅ Disable body scroll
- ✅ Return focus on close

**Don't:**
- ❌ Nest modals inside modals
- ❌ Use for simple confirmations (use ConfirmModal)
- ❌ Make modals too large on mobile
- ❌ Forget to handle escape key

### Tooltips

**Do:**
- ✅ Provide helpful context
- ✅ Use for icon buttons
- ✅ Keep text brief
- ✅ Make them keyboard accessible
- ✅ Choose appropriate placement

**Don't:**
- ❌ Use for essential information
- ❌ Put interactive elements in tooltips
- ❌ Make them too large
- ❌ Use when space allows for labels

---

## Accessibility

All Phase 3 components follow accessibility best practices:

### Toast
- ✅ Uses ARIA live regions
- ✅ Announces content to screen readers
- ✅ Keyboard dismissible
- ✅ High contrast colors

### Modal
- ✅ Focus trap (keeps focus inside)
- ✅ Returns focus on close
- ✅ Escape key support
- ✅ ARIA modal attributes
- ✅ Prevents body scroll

### Tooltip
- ✅ Keyboard accessible (focus/blur)
- ✅ ARIA tooltip role
- ✅ Proper visibility states
- ✅ Does not trap focus

---

## Next Steps

With Phase 3 complete, you now have:

1. ✅ **Phase 1:** Theme system and base components
2. ✅ **Phase 2:** Page migrations with enhanced UX
3. ✅ **Phase 3:** Interactive components (Toast, Modal, Tooltip)

### Future Enhancements
- Dropdown menus
- Date pickers
- Image upload with preview
- Advanced search filters
- Drag and drop

---

**Questions?** Refer to the component files for implementation details or check the integration examples above!
