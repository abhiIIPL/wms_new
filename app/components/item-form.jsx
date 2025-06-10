"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Save, ArrowLeft, Trash2 } from "lucide-react";
import { apiService } from "./api-service";
import { DeleteItemDialog } from "./delete-item-dialog";

export function ItemForm({ mode = "create", initialData = null, onClose }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    // Product Info Fields
    identifier: "",
    name: "",
    description: "",
    category: "",
    warehouse: "Main Warehouse",
    manufacturer_group: "",
    manufacturer: "",
    marketed_by: "",
    brand: "",
    pack_size: "",
    unit_per_pack: "",
    loose_sale: false,
    outer_quantity_pack: "",
    unit_measurement: "",
    form: "",
    schedule_type: "",
    primary_rack: "",
    secondary_rack: "",
    therapeutic: "",
    sub_therapeutic: "",
    is_chronic: false,
    is_tb: false,
    prescription_required: false,
    storage_type: "",
    is_active: true,
    color_type: "#3b82f6",
    salt_molecule: [],
    content: [],
    substitute_for: "",
    weight: "",
    weight_unit: "grams",
    max_quantity_return_expiry: "",
    is_dpco: false,

    // Pricing Info Fields
    hsn_sac: "",
    tax_category: "",
    min_margin_sale: "",
    min_margin_purchase: "",
    sale_rate: "",
    scheme_type: "",
    allow_discount: false,
    max_discount: "",
    discount: "",
    box_discount: "",
    box_mrp: "",
    box_ptr: "",
    force_sp: "",
    min_stock: "",
    max_stock: "",
    sales_days: "",
    expiry_days: "",

    // Other Fields
    lock_po_purchase: false,
    is_returnable: true,
    skip_from_apo: false,
  });

  const [saltMoleculeInput, setSaltMoleculeInput] = useState("");
  const [contentInput, setContentInput] = useState("");

  // Dropdown options
  const categories = [
    "Analgesics",
    "Antibiotics",
    "Diabetes Care",
    "Gastroenterology",
    "Respiratory",
    "Antihistamines",
    "Cardiovascular",
    "Dermatology",
    "Neurology",
    "Oncology",
  ];

  const unitMeasurements = [
    "Tablets",
    "Capsules",
    "ml",
    "grams",
    "Units",
    "Drops",
    "Sachets",
    "Vials",
  ];

  const forms = [
    "Blister Pack",
    "Bottle",
    "Strip",
    "Tube",
    "Vial",
    "Ampoule",
    "Sachet",
    "Inhaler",
  ];

  const scheduleTypes = [
    "Schedule H",
    "Schedule H1",
    "No Narcotics",
    "OTC",
    "Schedule X",
  ];

  const storageTypes = [
    "Room Temperature",
    "Refrigerated",
    "Frozen",
    "Controlled Temperature",
  ];

  const taxCategories = [
    "GST Sale - 5%",
    "GST Sale - 12%",
    "GST Sale - 18%",
    "GST Sale - 28%",
    "Exempt",
  ];

  const schemeTypes = ["Standard", "Dynamic", "Half Scheme", "No Scheme"];

  const weightUnits = ["grams", "kilograms", "milligrams", "ounces", "pounds"];

  // Initialize form with data if in edit mode
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        ...formData,
        ...initialData,
        salt_molecule: initialData.salt_molecule || [],
        content: initialData.content || [],
      });
    }
  }, [mode, initialData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddSaltMolecule = () => {
    if (saltMoleculeInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        salt_molecule: [...prev.salt_molecule, saltMoleculeInput.trim()],
      }));
      setSaltMoleculeInput("");
    }
  };

  const handleRemoveSaltMolecule = (index) => {
    setFormData((prev) => ({
      ...prev,
      salt_molecule: prev.salt_molecule.filter((_, i) => i !== index),
    }));
  };

  const handleAddContent = () => {
    if (contentInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        content: [...prev.content, contentInput.trim()],
      }));
      setContentInput("");
    }
  };

  const handleRemoveContent = (index) => {
    setFormData((prev) => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      if (mode === "edit") {
        response = await apiService.updateItem(initialData.id, formData);
      } else {
        response = await apiService.createItem(formData);
      }

      if (response.success) {
        navigate("/items");
      } else {
        console.error("Failed to save item:", response.error);
      }
    } catch (error) {
      console.error("Error saving item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id) return;

    setLoading(true);
    try {
      const response = await apiService.deleteItem(initialData.id);
      if (response.success) {
        navigate("/items");
      } else {
        console.error("Failed to delete item:", response.error);
      }
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/items");
    }
  };

  return (
    <div className="h-full flex flex-col" data-testid="item-form-container">
      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-auto" data-testid="item-form-content">
        <form
          id="item-form"
          onSubmit={handleSubmit}
          className="p-3"
          data-testid="item-form"
        >
          <div className="grid grid-cols-12 gap-3" data-testid="item-form-grid">
            {/* Left Column - Product Information */}
            <div
              className="col-span-6 space-y-6"
              data-testid="item-form-left-column"
            >
              {/* Basic Product Details */}
              <Card data-testid="item-form-basic-details-card">
                <CardHeader
                  className=""
                  data-testid="item-form-basic-details-header"
                >
                  <CardTitle
                    className="text-sm font-medium"
                    data-testid="item-form-basic-details-title"
                  >
                    Basic Product Details
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className="space-y-3"
                  data-testid="item-form-basic-details-content"
                >
                  <div
                    className="grid grid-cols-2 gap-3"
                    data-testid="item-form-basic-details-row-1"
                  >
                    <div
                      className="space-y-1"
                      data-testid="item-form-identifier-field"
                    >
                      <Label
                        htmlFor="identifier"
                        className="text-xs"
                        data-testid="item-form-identifier-label"
                      >
                        Identifier *
                      </Label>
                      <Input
                        id="identifier"
                        value={formData.identifier}
                        onChange={(e) =>
                          handleInputChange("identifier", e.target.value)
                        }
                        placeholder="5-digit code"
                        maxLength={5}
                        required
                        className="h-8 text-xs"
                        data-testid="item-form-identifier-input"
                      />
                    </div>
                    <div
                      className="space-y-1"
                      data-testid="item-form-category-field"
                    >
                      <Label
                        htmlFor="category"
                        className="text-xs"
                        data-testid="item-form-category-label"
                      >
                        Category *
                      </Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) =>
                          handleInputChange("category", value)
                        }
                        data-testid="item-form-category-select"
                      >
                        <SelectTrigger
                          className="h-8 text-xs"
                          data-testid="item-form-category-trigger"
                        >
                          <SelectValue
                            placeholder="Select category"
                            data-testid="item-form-category-value"
                          />
                        </SelectTrigger>
                        <SelectContent data-testid="item-form-category-content">
                          {categories.map((category, index) => (
                            <SelectItem
                              key={category}
                              value={category}
                              className="text-xs"
                              data-testid={`item-form-category-option-${index}`}
                            >
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1" data-testid="item-form-name-field">
                    <Label
                      htmlFor="name"
                      className="text-xs"
                      data-testid="item-form-name-label"
                    >
                      Product Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Enter product name"
                      required
                      className="h-8 text-xs"
                      data-testid="item-form-name-input"
                    />
                  </div>

                  <div
                    className="space-y-1"
                    data-testid="item-form-description-field"
                  >
                    <Label
                      htmlFor="description"
                      className="text-xs"
                      data-testid="item-form-description-label"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      placeholder="Enter product description"
                      rows={2}
                      className="text-xs resize-none"
                      data-testid="item-form-description-textarea"
                    />
                  </div>

                  <div
                    className="grid grid-cols-2 gap-3"
                    data-testid="item-form-basic-details-row-2"
                  >
                    <div
                      className="space-y-1"
                      data-testid="item-form-brand-field"
                    >
                      <Label
                        htmlFor="brand"
                        className="text-xs"
                        data-testid="item-form-brand-label"
                      >
                        Brand
                      </Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) =>
                          handleInputChange("brand", e.target.value)
                        }
                        placeholder="Brand name"
                        className="h-8 text-xs"
                        data-testid="item-form-brand-input"
                      />
                    </div>
                    <div
                      className="space-y-1"
                      data-testid="item-form-manufacturer-field"
                    >
                      <Label
                        htmlFor="manufacturer"
                        className="text-xs"
                        data-testid="item-form-manufacturer-label"
                      >
                        Manufacturer
                      </Label>
                      <Input
                        id="manufacturer"
                        value={formData.manufacturer}
                        onChange={(e) =>
                          handleInputChange("manufacturer", e.target.value)
                        }
                        placeholder="Manufacturer"
                        className="h-8 text-xs"
                        data-testid="item-form-manufacturer-input"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pack & Form Details */}
              <Card data-testid="item-form-pack-details-card">
                <CardHeader
                  className=""
                  data-testid="item-form-pack-details-header"
                >
                  <CardTitle
                    className="text-sm font-medium"
                    data-testid="item-form-pack-details-title"
                  >
                    Pack & Form Details
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className="space-y-3"
                  data-testid="item-form-pack-details-content"
                >
                  <div
                    className="grid grid-cols-3 gap-3"
                    data-testid="item-form-pack-details-row-1"
                  >
                    <div
                      className="space-y-1"
                      data-testid="item-form-pack-size-field"
                    >
                      <Label
                        htmlFor="pack_size"
                        className="text-xs"
                        data-testid="item-form-pack-size-label"
                      >
                        Pack Size
                      </Label>
                      <Input
                        id="pack_size"
                        value={formData.pack_size}
                        onChange={(e) =>
                          handleInputChange("pack_size", e.target.value)
                        }
                        placeholder="e.g., 20 tablets"
                        className="h-8 text-xs"
                        data-testid="item-form-pack-size-input"
                      />
                    </div>
                    <div
                      className="space-y-1"
                      data-testid="item-form-unit-per-pack-field"
                    >
                      <Label
                        htmlFor="unit_per_pack"
                        className="text-xs"
                        data-testid="item-form-unit-per-pack-label"
                      >
                        Units/Pack
                      </Label>
                      <Input
                        id="unit_per_pack"
                        type="number"
                        value={formData.unit_per_pack}
                        onChange={(e) =>
                          handleInputChange("unit_per_pack", e.target.value)
                        }
                        placeholder="Units"
                        className="h-8 text-xs"
                        data-testid="item-form-unit-per-pack-input"
                      />
                    </div>
                    <div
                      className="space-y-1"
                      data-testid="item-form-outer-quantity-field"
                    >
                      <Label
                        htmlFor="outer_quantity_pack"
                        className="text-xs"
                        data-testid="item-form-outer-quantity-label"
                      >
                        Outer Qty
                      </Label>
                      <Input
                        id="outer_quantity_pack"
                        type="number"
                        value={formData.outer_quantity_pack}
                        onChange={(e) =>
                          handleInputChange(
                            "outer_quantity_pack",
                            e.target.value
                          )
                        }
                        placeholder="Outer qty"
                        className="h-8 text-xs"
                        data-testid="item-form-outer-quantity-input"
                      />
                    </div>
                  </div>

                  <div
                    className="grid grid-cols-3 gap-3"
                    data-testid="item-form-pack-details-row-2"
                  >
                    <div
                      className="space-y-1"
                      data-testid="item-form-unit-measurement-field"
                    >
                      <Label
                        htmlFor="unit_measurement"
                        className="text-xs"
                        data-testid="item-form-unit-measurement-label"
                      >
                        Unit
                      </Label>
                      <Select
                        value={formData.unit_measurement}
                        onValueChange={(value) =>
                          handleInputChange("unit_measurement", value)
                        }
                        data-testid="item-form-unit-measurement-select"
                      >
                        <SelectTrigger
                          className="h-8 text-xs"
                          data-testid="item-form-unit-measurement-trigger"
                        >
                          <SelectValue
                            placeholder="Select unit"
                            data-testid="item-form-unit-measurement-value"
                          />
                        </SelectTrigger>
                        <SelectContent data-testid="item-form-unit-measurement-content">
                          {unitMeasurements.map((unit, index) => (
                            <SelectItem
                              key={unit}
                              value={unit}
                              className="text-xs"
                              data-testid={`item-form-unit-measurement-option-${index}`}
                            >
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div
                      className="space-y-1"
                      data-testid="item-form-form-field"
                    >
                      <Label
                        htmlFor="form"
                        className="text-xs"
                        data-testid="item-form-form-label"
                      >
                        Form
                      </Label>
                      <Select
                        value={formData.form}
                        onValueChange={(value) =>
                          handleInputChange("form", value)
                        }
                        data-testid="item-form-form-select"
                      >
                        <SelectTrigger
                          className="h-8 text-xs"
                          data-testid="item-form-form-trigger"
                        >
                          <SelectValue
                            placeholder="Select form"
                            data-testid="item-form-form-value"
                          />
                        </SelectTrigger>
                        <SelectContent data-testid="item-form-form-content">
                          {forms.map((form, index) => (
                            <SelectItem
                              key={form}
                              value={form}
                              className="text-xs"
                              data-testid={`item-form-form-option-${index}`}
                            >
                              {form}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div
                      className="space-y-1"
                      data-testid="item-form-schedule-type-field"
                    >
                      <Label
                        htmlFor="schedule_type"
                        className="text-xs"
                        data-testid="item-form-schedule-type-label"
                      >
                        Schedule
                      </Label>
                      <Select
                        value={formData.schedule_type}
                        onValueChange={(value) =>
                          handleInputChange("schedule_type", value)
                        }
                        data-testid="item-form-schedule-type-select"
                      >
                        <SelectTrigger
                          className="h-8 text-xs"
                          data-testid="item-form-schedule-type-trigger"
                        >
                          <SelectValue
                            placeholder="Schedule"
                            data-testid="item-form-schedule-type-value"
                          />
                        </SelectTrigger>
                        <SelectContent data-testid="item-form-schedule-type-content">
                          {scheduleTypes.map((schedule, index) => (
                            <SelectItem
                              key={schedule}
                              value={schedule}
                              className="text-xs"
                              data-testid={`item-form-schedule-type-option-${index}`}
                            >
                              {schedule}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div
                    className="flex items-center space-x-4"
                    data-testid="item-form-pack-switches"
                  >
                    <div
                      className="flex items-center space-x-2"
                      data-testid="item-form-loose-sale-switch"
                    >
                      <Switch
                        id="loose_sale"
                        checked={formData.loose_sale}
                        onCheckedChange={(checked) =>
                          handleInputChange("loose_sale", checked)
                        }
                        data-testid="item-form-loose-sale-input"
                      />
                      <Label
                        htmlFor="loose_sale"
                        className="text-xs"
                        data-testid="item-form-loose-sale-label"
                      >
                        Loose Sale
                      </Label>
                    </div>
                    <div
                      className="flex items-center space-x-2"
                      data-testid="item-form-prescription-required-switch"
                    >
                      <Switch
                        id="prescription_required"
                        checked={formData.prescription_required}
                        onCheckedChange={(checked) =>
                          handleInputChange("prescription_required", checked)
                        }
                        data-testid="item-form-prescription-required-input"
                      />
                      <Label
                        htmlFor="prescription_required"
                        className="text-xs"
                        data-testid="item-form-prescription-required-label"
                      >
                        Rx Required
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Storage & Location */}
              <Card data-testid="item-form-storage-card">
                <CardHeader className="" data-testid="item-form-storage-header">
                  <CardTitle
                    className="text-sm font-medium"
                    data-testid="item-form-storage-title"
                  >
                    Storage & Location
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className="space-y-3"
                  data-testid="item-form-storage-content"
                >
                  <div
                    className="grid grid-cols-3 gap-3"
                    data-testid="item-form-storage-row-1"
                  >
                    <div
                      className="space-y-1"
                      data-testid="item-form-primary-rack-field"
                    >
                      <Label
                        htmlFor="primary_rack"
                        className="text-xs"
                        data-testid="item-form-primary-rack-label"
                      >
                        Primary Rack
                      </Label>
                      <Input
                        id="primary_rack"
                        value={formData.primary_rack}
                        onChange={(e) =>
                          handleInputChange("primary_rack", e.target.value)
                        }
                        placeholder="e.g., A1-01"
                        className="h-8 text-xs"
                        data-testid="item-form-primary-rack-input"
                      />
                    </div>
                    <div
                      className="space-y-1"
                      data-testid="item-form-secondary-rack-field"
                    >
                      <Label
                        htmlFor="secondary_rack"
                        className="text-xs"
                        data-testid="item-form-secondary-rack-label"
                      >
                        Secondary Rack
                      </Label>
                      <Input
                        id="secondary_rack"
                        value={formData.secondary_rack}
                        onChange={(e) =>
                          handleInputChange("secondary_rack", e.target.value)
                        }
                        placeholder="e.g., B2-05"
                        className="h-8 text-xs"
                        data-testid="item-form-secondary-rack-input"
                      />
                    </div>
                    <div
                      className="space-y-1"
                      data-testid="item-form-storage-type-field"
                    >
                      <Label
                        htmlFor="storage_type"
                        className="text-xs"
                        data-testid="item-form-storage-type-label"
                      >
                        Storage Type
                      </Label>
                      <Select
                        value={formData.storage_type}
                        onValueChange={(value) =>
                          handleInputChange("storage_type", value)
                        }
                        data-testid="item-form-storage-type-select"
                      >
                        <SelectTrigger
                          className="h-8 text-xs"
                          data-testid="item-form-storage-type-trigger"
                        >
                          <SelectValue
                            placeholder="Storage"
                            data-testid="item-form-storage-type-value"
                          />
                        </SelectTrigger>
                        <SelectContent data-testid="item-form-storage-type-content">
                          {storageTypes.map((storage, index) => (
                            <SelectItem
                              key={storage}
                              value={storage}
                              className="text-xs"
                              data-testid={`item-form-storage-type-option-${index}`}
                            >
                              {storage}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div
                    className="grid grid-cols-2 gap-3"
                    data-testid="item-form-storage-row-2"
                  >
                    <div
                      className="space-y-1"
                      data-testid="item-form-therapeutic-field"
                    >
                      <Label
                        htmlFor="therapeutic"
                        className="text-xs"
                        data-testid="item-form-therapeutic-label"
                      >
                        Therapeutic
                      </Label>
                      <Input
                        id="therapeutic"
                        value={formData.therapeutic}
                        onChange={(e) =>
                          handleInputChange("therapeutic", e.target.value)
                        }
                        placeholder="Therapeutic class"
                        className="h-8 text-xs"
                        data-testid="item-form-therapeutic-input"
                      />
                    </div>
                    <div
                      className="space-y-1"
                      data-testid="item-form-sub-therapeutic-field"
                    >
                      <Label
                        htmlFor="sub_therapeutic"
                        className="text-xs"
                        data-testid="item-form-sub-therapeutic-label"
                      >
                        Sub-Therapeutic
                      </Label>
                      <Input
                        id="sub_therapeutic"
                        value={formData.sub_therapeutic}
                        onChange={(e) =>
                          handleInputChange("sub_therapeutic", e.target.value)
                        }
                        placeholder="Sub-therapeutic"
                        className="h-8 text-xs"
                        data-testid="item-form-sub-therapeutic-input"
                      />
                    </div>
                  </div>

                  <div
                    className="flex items-center space-x-4"
                    data-testid="item-form-storage-switches"
                  >
                    <div
                      className="flex items-center space-x-2"
                      data-testid="item-form-is-chronic-switch"
                    >
                      <Switch
                        id="is_chronic"
                        checked={formData.is_chronic}
                        onCheckedChange={(checked) =>
                          handleInputChange("is_chronic", checked)
                        }
                        data-testid="item-form-is-chronic-input"
                      />
                      <Label
                        htmlFor="is_chronic"
                        className="text-xs"
                        data-testid="item-form-is-chronic-label"
                      >
                        Chronic
                      </Label>
                    </div>
                    <div
                      className="flex items-center space-x-2"
                      data-testid="item-form-is-tb-switch"
                    >
                      <Switch
                        id="is_tb"
                        checked={formData.is_tb}
                        onCheckedChange={(checked) =>
                          handleInputChange("is_tb", checked)
                        }
                        data-testid="item-form-is-tb-input"
                      />
                      <Label
                        htmlFor="is_tb"
                        className="text-xs"
                        data-testid="item-form-is-tb-label"
                      >
                        TB
                      </Label>
                    </div>
                    <div
                      className="flex items-center space-x-2"
                      data-testid="item-form-color-type-field"
                    >
                      <Label
                        htmlFor="color_type"
                        className="text-xs"
                        data-testid="item-form-color-type-label"
                      >
                        Color
                      </Label>
                      <Input
                        id="color_type"
                        type="color"
                        value={formData.color_type}
                        onChange={(e) =>
                          handleInputChange("color_type", e.target.value)
                        }
                        className="h-8 w-16"
                        data-testid="item-form-color-type-input"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Salt/Molecule & Content */}
              <Card data-testid="item-form-salt-content-card">
                <CardHeader
                  className=""
                  data-testid="item-form-salt-content-header"
                >
                  <CardTitle
                    className="text-sm font-medium"
                    data-testid="item-form-salt-content-title"
                  >
                    Salt/Molecule & Content
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className="space-y-3"
                  data-testid="item-form-salt-content-content"
                >
                  <div
                    className="space-y-2"
                    data-testid="item-form-salt-molecule-section"
                  >
                    <Label
                      className="text-xs"
                      data-testid="item-form-salt-molecule-label"
                    >
                      Salt/Molecule
                    </Label>
                    <div
                      className="flex gap-2"
                      data-testid="item-form-salt-molecule-input-row"
                    >
                      <Input
                        value={saltMoleculeInput}
                        onChange={(e) => setSaltMoleculeInput(e.target.value)}
                        placeholder="Enter salt/molecule"
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddSaltMolecule())
                        }
                        className="h-8 text-xs"
                        data-testid="item-form-salt-molecule-input"
                      />
                      <Button
                        type="button"
                        onClick={handleAddSaltMolecule}
                        size="sm"
                        className="h-8 px-2"
                        data-testid="item-form-salt-molecule-add-button"
                      >
                        <Plus
                          className="h-3 w-3"
                          data-testid="item-form-salt-molecule-add-icon"
                        />
                      </Button>
                    </div>
                    <div
                      className="flex flex-wrap gap-1"
                      data-testid="item-form-salt-molecule-badges"
                    >
                      {formData.salt_molecule.map((salt, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-[10px] px-1 py-0 h-5 flex items-center gap-1"
                          data-testid={`item-form-salt-molecule-badge-${index}`}
                        >
                          {salt}
                          <X
                            className="h-2 w-2 cursor-pointer"
                            onClick={() => handleRemoveSaltMolecule(index)}
                            data-testid={`item-form-salt-molecule-remove-${index}`}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div
                    className="space-y-2"
                    data-testid="item-form-content-section"
                  >
                    <Label
                      className="text-xs"
                      data-testid="item-form-content-label"
                    >
                      Content
                    </Label>
                    <div
                      className="flex gap-2"
                      data-testid="item-form-content-input-row"
                    >
                      <Input
                        value={contentInput}
                        onChange={(e) => setContentInput(e.target.value)}
                        placeholder="Enter content"
                        onKeyPress={(e) =>
                          e.key === "Enter" &&
                          (e.preventDefault(), handleAddContent())
                        }
                        className="h-8 text-xs"
                        data-testid="item-form-content-input"
                      />
                      <Button
                        type="button"
                        onClick={handleAddContent}
                        size="sm"
                        className="h-8 px-2"
                        data-testid="item-form-content-add-button"
                      >
                        <Plus
                          className="h-3 w-3"
                          data-testid="item-form-content-add-icon"
                        />
                      </Button>
                    </div>
                    <div
                      className="flex flex-wrap gap-1"
                      data-testid="item-form-content-badges"
                    >
                      {formData.content.map((content, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-[10px] px-1 py-0 h-5 flex items-center gap-1"
                          data-testid={`item-form-content-badge-${index}`}
                        >
                          {content}
                          <X
                            className="h-2 w-2 cursor-pointer"
                            onClick={() => handleRemoveContent(index)}
                            data-testid={`item-form-content-remove-${index}`}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div
                    className="grid grid-cols-2 gap-3"
                    data-testid="item-form-weight-row"
                  >
                    <div
                      className="space-y-1"
                      data-testid="item-form-weight-field"
                    >
                      <Label
                        htmlFor="weight"
                        className="text-xs"
                        data-testid="item-form-weight-label"
                      >
                        Weight
                      </Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        value={formData.weight}
                        onChange={(e) =>
                          handleInputChange("weight", e.target.value)
                        }
                        placeholder="Weight"
                        className="h-8 text-xs"
                        data-testid="item-form-weight-input"
                      />
                    </div>
                    <div
                      className="space-y-1"
                      data-testid="item-form-weight-unit-field"
                    >
                      <Label
                        htmlFor="weight_unit"
                        className="text-xs"
                        data-testid="item-form-weight-unit-label"
                      >
                        Weight Unit
                      </Label>
                      <Select
                        value={formData.weight_unit}
                        onValueChange={(value) =>
                          handleInputChange("weight_unit", value)
                        }
                        data-testid="item-form-weight-unit-select"
                      >
                        <SelectTrigger
                          className="h-8 text-xs"
                          data-testid="item-form-weight-unit-trigger"
                        >
                          <SelectValue
                            placeholder="Unit"
                            data-testid="item-form-weight-unit-value"
                          />
                        </SelectTrigger>
                        <SelectContent data-testid="item-form-weight-unit-content">
                          {weightUnits.map((unit, index) => (
                            <SelectItem
                              key={unit}
                              value={unit}
                              className="text-xs"
                              data-testid={`item-form-weight-unit-option-${index}`}
                            >
                              {unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Pricing & Other Information */}
            <div
              className="col-span-6 space-y-6"
              data-testid="item-form-right-column"
            >
              {/* Tax & HSN Information */}
              <Card data-testid="item-form-tax-hsn-card">
                <CardHeader className="" data-testid="item-form-tax-hsn-header">
                  <CardTitle
                    className="text-sm font-medium"
                    data-testid="item-form-tax-hsn-title"
                  >
                    Tax & HSN Information
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className="space-y-3"
                  data-testid="item-form-tax-hsn-content"
                >
                  <div
                    className="grid grid-cols-2 gap-3"
                    data-testid="item-form-tax-hsn-row"
                  >
                    <div
                      className="space-y-1"
                      data-testid="item-form-hsn-sac-field"
                    >
                      <Label
                        htmlFor="hsn_sac"
                        className="text-xs"
                        data-testid="item-form-hsn-sac-label"
                      >
                        HSN/SAC Code
                      </Label>
                      <Input
                        id="hsn_sac"
                        value={formData.hsn_sac}
                        onChange={(e) =>
                          handleInputChange("hsn_sac", e.target.value)
                        }
                        placeholder="HSN/SAC code"
                        className="h-8 text-xs"
                        data-testid="item-form-hsn-sac-input"
                      />
                    </div>
                    <div
                      className="space-y-1"
                      data-testid="item-form-tax-category-field"
                    >
                      <Label
                        htmlFor="tax_category"
                        className="text-xs"
                        data-testid="item-form-tax-category-label"
                      >
                        Tax Category
                      </Label>
                      <Select
                        value={formData.tax_category}
                        onValueChange={(value) =>
                          handleInputChange("tax_category", value)
                        }
                        data-testid="item-form-tax-category-select"
                      >
                        <SelectTrigger
                          className="h-8 text-xs"
                          data-testid="item-form-tax-category-trigger"
                        >
                          <SelectValue
                            placeholder="Tax category"
                            data-testid="item-form-tax-category-value"
                          />
                        </SelectTrigger>
                        <SelectContent data-testid="item-form-tax-category-content">
                          {taxCategories.map((tax, index) => (
                            <SelectItem
                              key={tax}
                              value={tax}
                              className="text-xs"
                              data-testid={`item-form-tax-category-option-${index}`}
                            >
                              {tax}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pricing & Margins */}
              <Card data-testid="item-form-pricing-margins-card">
                <CardHeader
                  className=""
                  data-testid="item-form-pricing-margins-header"
                >
                  <CardTitle
                    className="text-sm font-medium"
                    data-testid="item-form-pricing-margins-title"
                  >
                    Pricing & Margins
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className="space-y-3"
                  data-testid="item-form-pricing-margins-content"
                >
                  <div
                    className="grid grid-cols-3 gap-3"
                    data-testid="item-form-pricing-margins-row-1"
                  >
                    <div
                      className="space-y-1"
                      data-testid="item-form-sale-rate-field"
                    >
                      <Label
                        htmlFor="sale_rate"
                        className="text-xs"
                        data-testid="item-form-sale-rate-label"
                      >
                        Sale Rate
                      </Label>
                      <Input
                        id="sale_rate"
                        type="number"
                        step="0.01"
                        value={formData.sale_rate}
                        onChange={(e) =>
                          handleInputChange("sale_rate", e.target.value)
                        }
                        placeholder="Sale rate"
                        className="h-8 text-xs"
                        data-testid="item-form-sale-rate-input"
                      />
                    </div>
                    <div
                      className="space-y-1"
                      data-testid="item-form-min-margin-sale-field"
                    >
                      <Label
                        htmlFor="min_margin_sale"
                        className="text-xs"
                        data-testid="item-form-min-margin-sale-label"
                      >
                        Min Margin % (Sale)
                      </Label>
                      <Input
                        id="min_margin_sale"
                        type="number"
                        step="0.01"
                        value={formData.min_margin_sale}
                        onChange={(e) =>
                          handleInputChange("min_margin_sale", e.target.value)
                        }
                        placeholder="Min margin"
                        className="h-8 text-xs"
                        data-testid="item-form-min-margin-sale-input"
                      />
                    </div>
                    <div
                      className="space-y-1"
                      data-testid="item-form-min-margin-purchase-field"
                    >
                      <Label
                        htmlFor="min_margin_purchase"
                        className="text-xs"
                        data-testid="item-form-min-margin-purchase-label"
                      >
                        Min Margin % (Purchase)
                      </Label>
                      <Input
                        id="min_margin_purchase"
                        type="number"
                        step="0.01"
                        value={formData.min_margin_purchase}
                        onChange={(e) =>
                          handleInputChange(
                            "min_margin_purchase",
                            e.target.value
                          )
                        }
                        placeholder="Min margin"
                        className="h-8 text-xs"
                        data-testid="item-form-min-margin-purchase-input"
                      />
                    </div>
                  </div>

                  <div
                    className="grid grid-cols-3 gap-3"
                    data-testid="item-form-pricing-margins-row-2"
                  >
                    <div
                      className="space-y-1"
                      data-testid="item-form-box-mrp-field"
                    >
                      <Label
                        htmlFor="box_mrp"
                        className="text-xs"
                        data-testid="item-form-box-mrp-label"
                      >
                        Box MRP
                      </Label>
                      <Input
                        id="box_mrp"
                        type="number"
                        step="0.01"
                        value={formData.box_mrp}
                        onChange={(e) =>
                          handleInputChange("box_mrp", e.target.value)
                        }
                        placeholder="Box MRP"
                        className="h-8 text-xs"
                        data-testid="item-form-box-mrp-input"
                      />
                    </div>
                    <div
                      className="space-y-1"
                      data-testid="item-form-box-ptr-field"
                    >
                      <Label
                        htmlFor="box_ptr"
                        className="text-xs"
                        data-testid="item-form-box-ptr-label"
                      >
                        Box PTR
                      </Label>
                      <Input
                        id="box_ptr"
                        type="number"
                        step="0.01"
                        value={formData.box_ptr}
                        onChange={(e) =>
                          handleInputChange("box_ptr", e.target.value)
                        }
                        placeholder="Box PTR"
                        className="h-8 text-xs"
                        data-testid="item-form-box-ptr-input"
                      />
                    </div>
                    <div
                      className="space-y-1"
                      data-testid="item-form-force-sp-field"
                    >
                      <Label
                        htmlFor="force_sp"
                        className="text-xs"
                        data-testid="item-form-force-sp-label"
                      >
                        Force SP
                      </Label>
                      <Input
                        id="force_sp"
                        type="number"
                        step="0.01"
                        value={formData.force_sp}
                        onChange={(e) =>
                          handleInputChange("force_sp", e.target.value)
                        }
                        placeholder="Force SP"
                        className="h-8 text-xs"
                        data-testid="item-form-force-sp-input"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Discount & Scheme */}
              <Card data-testid="item-form-discount-scheme-card">
                <CardHeader
                  className=""
                  data-testid="item-form-discount-scheme-header"
                >
                  <CardTitle
                    className="text-sm font-medium"
                    data-testid="item-form-discount-scheme-title"
                  >
                    Discount & Scheme
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className="space-y-3"
                  data-testid="item-form-discount-scheme-content"
                >
                  <div
                    className="grid grid-cols-2 gap-3"
                    data-testid="item-form-discount-scheme-row-1"
                  >
                    <div
                      className="space-y-1"
                      data-testid="item-form-scheme-type-field"
                    >
                      <Label
                        htmlFor="scheme_type"
                        className="text-xs"
                        data-testid="item-form-scheme-type-label"
                      >
                        Scheme Type
                      </Label>
                      <Select
                        value={formData.scheme_type}
                        onValueChange={(value) =>
                          handleInputChange("scheme_type", value)
                        }
                        data-testid="item-form-scheme-type-select"
                      >
                        <SelectTrigger
                          className="h-8 text-xs"
                          data-testid="item-form-scheme-type-trigger"
                        >
                          <SelectValue
                            placeholder="Scheme type"
                            data-testid="item-form-scheme-type-value"
                          />
                        </SelectTrigger>
                        <SelectContent data-testid="item-form-scheme-type-content">
                          {schemeTypes.map((scheme, index) => (
                            <SelectItem
                              key={scheme}
                              value={scheme}
                              className="text-xs"
                              data-testid={`item-form-scheme-type-option-${index}`}
                            >
                              {scheme}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div
                      className="flex items-center space-x-2 pt-5"
                      data-testid="item-form-allow-discount-switch"
                    >
                      <Switch
                        id="allow_discount"
                        checked={formData.allow_discount}
                        onCheckedChange={(checked) =>
                          handleInputChange("allow_discount", checked)
                        }
                        data-testid="item-form-allow-discount-input"
                      />
                      <Label
                        htmlFor="allow_discount"
                        className="text-xs"
                        data-testid="item-form-allow-discount-label"
                      >
                        Allow Discount
                      </Label>
                    </div>
                  </div>

                  <div
                    className="grid grid-cols-4 gap-3"
                    data-testid="item-form-discount-scheme-row-2"
                  >
                    <div
                      className="space-y-1"
                      data-testid="item-form-max-discount-field"
                    >
                      <Label
                        htmlFor="max_discount"
                        className="text-xs"
                        data-testid="item-form-max-discount-label"
                      >
                        Max Discount %
                      </Label>
                      <Input
                        id="max_discount"
                        type="number"
                        step="0.01"
                        value={formData.max_discount}
                        onChange={(e) =>
                          handleInputChange("max_discount", e.target.value)
                        }
                        placeholder="Max %"
                        className="h-8 text-xs"
                        data-testid="item-form-max-discount-input"
                      />
                    </div>
                    <div
                      className="space-y-1"
                      data-testid="item-form-discount-field"
                    >
                      <Label
                        htmlFor="discount"
                        className="text-xs"
                        data-testid="item-form-discount-label"
                      >
                        Discount %
                      </Label>
                      <Input
                        id="discount"
                        type="number"
                        step="0.01"
                        value={formData.discount}
                        onChange={(e) =>
                          handleInputChange("discount", e.target.value)
                        }
                        placeholder="Discount %"
                        className="h-8 text-xs"
                        data-testid="item-form-discount-input"
                      />
                    </div>
                    <div
                      className="space-y-1"
                      data-testid="item-form-box-discount-field"
                    >
                      <Label
                        htmlFor="box_discount"
                        className="text-xs"
                        data-testid="item-form-box-discount-label"
                      >
                        Box Discount %
                      </Label>
                      <Input
                        id="box_discount"
                        type="number"
                        step="0.01"
                        value={formData.box_discount}
                        onChange={(e) =>
                          handleInputChange("box_discount", e.target.value)
                        }
                        placeholder="Box %"
                        className="h-8 text-xs"
                        data-testid="item-form-box-discount-input"
                      />
                    </div>
                    <div
                      className="flex items-center space-x-2 pt-5"
                      data-testid="item-form-is-dpco-switch"
                    >
                      <Switch
                        id="is_dpco"
                        checked={formData.is_dpco}
                        onCheckedChange={(checked) =>
                          handleInputChange("is_dpco", checked)
                        }
                        data-testid="item-form-is-dpco-input"
                      />
                      <Label
                        htmlFor="is_dpco"
                        className="text-xs"
                        data-testid="item-form-is-dpco-label"
                      >
                        DPCO
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stock & Days */}
              <Card data-testid="item-form-stock-days-card">
                <CardHeader
                  className=""
                  data-testid="item-form-stock-days-header"
                >
                  <CardTitle
                    className="text-sm font-medium"
                    data-testid="item-form-stock-days-title"
                  >
                    Stock & Days
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className="space-y-3"
                  data-testid="item-form-stock-days-content"
                >
                  <div
                    className="grid grid-cols-4 gap-3"
                    data-testid="item-form-stock-days-row"
                  >
                    <div
                      className="space-y-1"
                      data-testid="item-form-min-stock-field"
                    >
                      <Label
                        htmlFor="min_stock"
                        className="text-xs"
                        data-testid="item-form-min-stock-label"
                      >
                        Min Stock
                      </Label>
                      <Input
                        id="min_stock"
                        type="number"
                        value={formData.min_stock}
                        onChange={(e) =>
                          handleInputChange("min_stock", e.target.value)
                        }
                        placeholder="Min stock"
                        className="h-8 text-xs"
                        data-testid="item-form-min-stock-input"
                      />
                    </div>
                    <div
                      className="space-y-1"
                      data-testid="item-form-max-stock-field"
                    >
                      <Label
                        htmlFor="max_stock"
                        className="text-xs"
                        data-testid="item-form-max-stock-label"
                      >
                        Max Stock
                      </Label>
                      <Input
                        id="max_stock"
                        type="number"
                        value={formData.max_stock}
                        onChange={(e) =>
                          handleInputChange("max_stock", e.target.value)
                        }
                        placeholder="Max stock"
                        className="h-8 text-xs"
                        data-testid="item-form-max-stock-input"
                      />
                    </div>
                    <div
                      className="space-y-1"
                      data-testid="item-form-sales-days-field"
                    >
                      <Label
                        htmlFor="sales_days"
                        className="text-xs"
                        data-testid="item-form-sales-days-label"
                      >
                        Sales Days
                      </Label>
                      <Input
                        id="sales_days"
                        type="number"
                        value={formData.sales_days}
                        onChange={(e) =>
                          handleInputChange("sales_days", e.target.value)
                        }
                        placeholder="Sales days"
                        className="h-8 text-xs"
                        data-testid="item-form-sales-days-input"
                      />
                    </div>
                    <div
                      className="space-y-1"
                      data-testid="item-form-expiry-days-field"
                    >
                      <Label
                        htmlFor="expiry_days"
                        className="text-xs"
                        data-testid="item-form-expiry-days-label"
                      >
                        Expiry Days
                      </Label>
                      <Input
                        id="expiry_days"
                        type="number"
                        value={formData.expiry_days}
                        onChange={(e) =>
                          handleInputChange("expiry_days", e.target.value)
                        }
                        placeholder="Expiry days"
                        className="h-8 text-xs"
                        data-testid="item-form-expiry-days-input"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Settings */}
              <Card data-testid="item-form-additional-settings-card">
                <CardHeader
                  className=""
                  data-testid="item-form-additional-settings-header"
                >
                  <CardTitle
                    className="text-sm font-medium"
                    data-testid="item-form-additional-settings-title"
                  >
                    Additional Settings
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className="space-y-3"
                  data-testid="item-form-additional-settings-content"
                >
                  <div
                    className="grid grid-cols-2 gap-6"
                    data-testid="item-form-additional-settings-grid"
                  >
                    <div
                      className="space-y-3"
                      data-testid="item-form-additional-settings-left"
                    >
                      <div
                        className="flex items-center space-x-2"
                        data-testid="item-form-lock-po-purchase-switch"
                      >
                        <Switch
                          id="lock_po_purchase"
                          checked={formData.lock_po_purchase}
                          onCheckedChange={(checked) =>
                            handleInputChange("lock_po_purchase", checked)
                          }
                          data-testid="item-form-lock-po-purchase-input"
                        />
                        <Label
                          htmlFor="lock_po_purchase"
                          className="text-xs"
                          data-testid="item-form-lock-po-purchase-label"
                        >
                          Lock PO/Purchase
                        </Label>
                      </div>

                      <div
                        className="flex items-center space-x-2"
                        data-testid="item-form-is-returnable-switch"
                      >
                        <Switch
                          id="is_returnable"
                          checked={formData.is_returnable}
                          onCheckedChange={(checked) =>
                            handleInputChange("is_returnable", checked)
                          }
                          data-testid="item-form-is-returnable-input"
                        />
                        <Label
                          htmlFor="is_returnable"
                          className="text-xs"
                          data-testid="item-form-is-returnable-label"
                        >
                          Is Returnable
                        </Label>
                      </div>

                      <div
                        className="flex items-center space-x-2"
                        data-testid="item-form-skip-from-apo-switch"
                      >
                        <Switch
                          id="skip_from_apo"
                          checked={formData.skip_from_apo}
                          onCheckedChange={(checked) =>
                            handleInputChange("skip_from_apo", checked)
                          }
                          data-testid="item-form-skip-from-apo-input"
                        />
                        <Label
                          htmlFor="skip_from_apo"
                          className="text-xs"
                          data-testid="item-form-skip-from-apo-label"
                        >
                          Skip from APO
                        </Label>
                      </div>

                      <div
                        className="flex items-center space-x-2"
                        data-testid="item-form-is-active-switch"
                      >
                        <Switch
                          id="is_active"
                          checked={formData.is_active}
                          onCheckedChange={(checked) =>
                            handleInputChange("is_active", checked)
                          }
                          data-testid="item-form-is-active-input"
                        />
                        <Label
                          htmlFor="is_active"
                          className="text-xs"
                          data-testid="item-form-is-active-label"
                        >
                          Active Status
                        </Label>
                      </div>
                    </div>

                    <div
                      className="space-y-3"
                      data-testid="item-form-additional-settings-right"
                    >
                      <div
                        className="space-y-1"
                        data-testid="item-form-max-quantity-return-expiry-field"
                      >
                        <Label
                          htmlFor="max_quantity_return_expiry"
                          className="text-xs"
                          data-testid="item-form-max-quantity-return-expiry-label"
                        >
                          Max Qty Return/Expiry
                        </Label>
                        <Input
                          id="max_quantity_return_expiry"
                          type="number"
                          value={formData.max_quantity_return_expiry}
                          onChange={(e) =>
                            handleInputChange(
                              "max_quantity_return_expiry",
                              e.target.value
                            )
                          }
                          placeholder="Max quantity"
                          className="h-8 text-xs"
                          data-testid="item-form-max-quantity-return-expiry-input"
                        />
                      </div>

                      <div
                        className="space-y-1"
                        data-testid="item-form-substitute-for-field"
                      >
                        <Label
                          htmlFor="substitute_for"
                          className="text-xs"
                          data-testid="item-form-substitute-for-label"
                        >
                          Substitute For
                        </Label>
                        <Input
                          id="substitute_for"
                          value={formData.substitute_for}
                          onChange={(e) =>
                            handleInputChange("substitute_for", e.target.value)
                          }
                          placeholder="Substitute product"
                          className="h-8 text-xs"
                          data-testid="item-form-substitute-for-input"
                        />
                      </div>

                      <div
                        className="space-y-1"
                        data-testid="item-form-marketed-by-field"
                      >
                        <Label
                          htmlFor="marketed_by"
                          className="text-xs"
                          data-testid="item-form-marketed-by-label"
                        >
                          Marketed By
                        </Label>
                        <Input
                          id="marketed_by"
                          value={formData.marketed_by}
                          onChange={(e) =>
                            handleInputChange("marketed_by", e.target.value)
                          }
                          placeholder="Marketing company"
                          className="h-8 text-xs"
                          data-testid="item-form-marketed-by-input"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>

      {/* Fixed Bottom Action Buttons */}
      <div
        className="flex-shrink-0 border-t bg-background px-6 py-4"
        data-testid="item-form-actions"
      >
        <div
          className="flex justify-between items-center"
          data-testid="item-form-actions-layout"
        >
          {/* Left side - Delete button (only in edit mode) */}
          <div data-testid="item-form-actions-left">
            {mode === "edit" && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                size="sm"
                data-testid="item-form-delete-button"
              >
                <Trash2
                  className="h-4 w-4 mr-2"
                  data-testid="item-form-delete-icon"
                />
                Delete Item
              </Button>
            )}
          </div>

          {/* Right side - Cancel and Save buttons */}
          <div
            className="flex items-center gap-3"
            data-testid="item-form-actions-right"
          >
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              size="sm"
              data-testid="item-form-cancel-button"
            >
              <ArrowLeft
                className="h-4 w-4 mr-2"
                data-testid="item-form-cancel-icon"
              />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              size="sm"
              form="item-form"
              data-testid="item-form-save-button"
            >
              <Save
                className="h-4 w-4 mr-2"
                data-testid="item-form-save-icon"
              />
              {loading
                ? "Saving..."
                : mode === "edit"
                ? "Update Item"
                : "Create Item"}
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <DeleteItemDialog
          item={initialData}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
          data-testid="item-form-delete-dialog"
        />
      )}
    </div>
  );
}
