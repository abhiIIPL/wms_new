"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { X, Save, Package, DollarSign, Info, Settings, ArrowLeft } from "lucide-react";
import { apiService } from "./api-service";

export function ItemForm({ mode = "create", initialData = null, onClose }) {
  const navigate = useNavigate();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("product-info");
  const [errors, setErrors] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Form refs for focus management
  const firstInputRef = useRef(null);
  const cancelBtnRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    // Product Info Fields
    product_code: "",
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
    storage_type: "Room Temperature",
    is_active: true,
    color_type: "#3b82f6",
    salt_molecule: [],
    content: [],
    substitute_for: null,
    weight: "",
    weight_unit: "grams",
    max_quantity_return_expiry: "",
    is_dpco: false,

    // Pricing Info Fields
    hsn_sac: "",
    tax_category: "GST Sale - 12%",
    min_margin_sale: "",
    min_margin_purchase: "",
    sale_rate: "",
    scheme_type: "Standard",
    allow_discount: true,
    max_discount: "",
    discount: "",
    box_discount: "",
    box_mrp: "",
    box_ptr: "",
    force_sp: null,
    min_stock: "",
    max_stock: "",
    sales_days: "",
    expiry_days: "",

    // Other Fields
    lock_po_purchase: false,
    is_returnable: true,
    skip_from_apo: false,
  });

  // Initialize form data
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        // Ensure arrays are properly handled
        salt_molecule: initialData.salt_molecule || [],
        content: initialData.content || [],
        // Convert numbers to strings for form inputs
        unit_per_pack: initialData.unit_per_pack?.toString() || "",
        outer_quantity_pack: initialData.outer_quantity_pack?.toString() || "",
        weight: initialData.weight?.toString() || "",
        max_quantity_return_expiry: initialData.max_quantity_return_expiry?.toString() || "",
        min_margin_sale: initialData.min_margin_sale?.toString() || "",
        min_margin_purchase: initialData.min_margin_purchase?.toString() || "",
        sale_rate: initialData.sale_rate?.toString() || "",
        max_discount: initialData.max_discount?.toString() || "",
        discount: initialData.discount?.toString() || "",
        box_discount: initialData.box_discount?.toString() || "",
        box_mrp: initialData.box_mrp?.toString() || "",
        box_ptr: initialData.box_ptr?.toString() || "",
        min_stock: initialData.min_stock?.toString() || "",
        max_stock: initialData.max_stock?.toString() || "",
        sales_days: initialData.sales_days?.toString() || "",
        expiry_days: initialData.expiry_days?.toString() || "",
      }));
    }
  }, [mode, initialData]);

  // Focus first input on mount
  useEffect(() => {
    if (firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, []);

  // ✅ Handle Escape key to trigger cancel button
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && cancelBtnRef.current) {
        event.preventDefault();
        cancelBtnRef.current.click();
      }
    };

    // Add event listener to document
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handle input changes
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
    
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  }, [errors]);

  // Handle array field changes (salt_molecule, content)
  const handleArrayChange = useCallback((field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
    setHasUnsavedChanges(true);
  }, []);

  const addArrayItem = useCallback((field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ""]
    }));
    setHasUnsavedChanges(true);
  }, []);

  const removeArrayItem = useCallback((field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Validation
  const validateForm = useCallback(() => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }
    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }
    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = "Manufacturer is required";
    }

    // Numeric validations
    if (formData.unit_per_pack && isNaN(Number(formData.unit_per_pack))) {
      newErrors.unit_per_pack = "Must be a valid number";
    }
    if (formData.weight && isNaN(Number(formData.weight))) {
      newErrors.weight = "Must be a valid number";
    }
    if (formData.sale_rate && isNaN(Number(formData.sale_rate))) {
      newErrors.sale_rate = "Must be a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      // Convert string numbers back to numbers for API
      const apiData = {
        ...formData,
        unit_per_pack: formData.unit_per_pack ? Number(formData.unit_per_pack) : null,
        outer_quantity_pack: formData.outer_quantity_pack ? Number(formData.outer_quantity_pack) : null,
        weight: formData.weight ? Number(formData.weight) : null,
        max_quantity_return_expiry: formData.max_quantity_return_expiry ? Number(formData.max_quantity_return_expiry) : null,
        min_margin_sale: formData.min_margin_sale ? Number(formData.min_margin_sale) : null,
        min_margin_purchase: formData.min_margin_purchase ? Number(formData.min_margin_purchase) : null,
        sale_rate: formData.sale_rate ? Number(formData.sale_rate) : null,
        max_discount: formData.max_discount ? Number(formData.max_discount) : null,
        discount: formData.discount ? Number(formData.discount) : null,
        box_discount: formData.box_discount ? Number(formData.box_discount) : null,
        box_mrp: formData.box_mrp ? Number(formData.box_mrp) : null,
        box_ptr: formData.box_ptr ? Number(formData.box_ptr) : null,
        min_stock: formData.min_stock ? Number(formData.min_stock) : null,
        max_stock: formData.max_stock ? Number(formData.max_stock) : null,
        sales_days: formData.sales_days ? Number(formData.sales_days) : null,
        expiry_days: formData.expiry_days ? Number(formData.expiry_days) : null,
        // Legacy price field for compatibility
        price: formData.sale_rate ? Number(formData.sale_rate) : 0,
      };

      let response;
      if (mode === "edit" && params?.itemId) {
        response = await apiService.updateItem(params.itemId, apiData);
      } else {
        response = await apiService.createItem(apiData);
      }

      if (response.success) {
        setHasUnsavedChanges(false);
        navigate("/items");
      } else {
        console.error("Save failed:", response.error);
        // Handle error (show toast, etc.)
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes. Are you sure you want to cancel?")) {
        navigate("/items");
      }
    } else {
      navigate("/items");
    }
  };

  // Categories for dropdown
  const categories = [
    "Analgesics", "Antibiotics", "Diabetes Care", "Gastroenterology", "Respiratory",
    "Antihistamines", "Cardiovascular", "Dermatology", "Neurology", "Oncology"
  ];

  const scheduleTypes = ["Schedule H", "Schedule H1", "No Narcotics", "OTC"];
  const storageTypes = ["Room Temperature", "Refrigerated", "Frozen", "Controlled"];
  const schemeTypes = ["Standard", "Dynamic", "Half Scheme"];
  const taxCategories = ["GST Sale - 5%", "GST Sale - 12%", "GST Sale - 18%", "GST Sale - 28%"];
  const weightUnits = ["grams", "kg", "mg"];

  return (
    <div className="h-full flex flex-col bg-background" data-testid="item-form">
      {/* Header */}
      <div className="flex-shrink-0 border-b bg-background px-6 py-4" data-testid="item-form-header">
        <div className="flex items-center justify-between" data-testid="item-form-header-content">
          <div className="flex items-center gap-3" data-testid="item-form-header-left">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              ref={cancelBtnRef}
              className="h-8 w-8 p-0"
              data-testid="item-form-back-button"
            >
              <ArrowLeft className="h-4 w-4" data-testid="item-form-back-icon" />
            </Button>
            <div data-testid="item-form-header-text">
              <h1 className="text-xl font-semibold" data-testid="item-form-title">
                {mode === "edit" ? "Edit Item" : "Add New Item"}
              </h1>
              <p className="text-sm text-muted-foreground" data-testid="item-form-subtitle">
                {mode === "edit" 
                  ? "Update item information and pricing details" 
                  : "Create a new item in your inventory"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2" data-testid="item-form-header-actions">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
              data-testid="item-form-cancel-button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              data-testid="item-form-save-button"
            >
              {saving ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border border-current border-t-transparent mr-2" data-testid="item-form-save-spinner" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" data-testid="item-form-save-icon" />
                  {mode === "edit" ? "Update Item" : "Create Item"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-auto" data-testid="item-form-content">
        <div className="max-w-4xl mx-auto p-6" data-testid="item-form-container">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" data-testid="item-form-tabs">
            <TabsList className="grid w-full grid-cols-4" data-testid="item-form-tabs-list">
              <TabsTrigger value="product-info" className="flex items-center gap-2" data-testid="item-form-tab-product">
                <Package className="h-4 w-4" data-testid="item-form-tab-product-icon" />
                Product Info
              </TabsTrigger>
              <TabsTrigger value="pricing-info" className="flex items-center gap-2" data-testid="item-form-tab-pricing">
                <DollarSign className="h-4 w-4" data-testid="item-form-tab-pricing-icon" />
                Pricing Info
              </TabsTrigger>
              <TabsTrigger value="additional-info" className="flex items-center gap-2" data-testid="item-form-tab-additional">
                <Info className="h-4 w-4" data-testid="item-form-tab-additional-icon" />
                Additional Info
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2" data-testid="item-form-tab-settings">
                <Settings className="h-4 w-4" data-testid="item-form-tab-settings-icon" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* Product Info Tab */}
            <TabsContent value="product-info" className="space-y-6" data-testid="item-form-product-content">
              <Card data-testid="item-form-basic-info-card">
                <CardHeader data-testid="item-form-basic-info-header">
                  <CardTitle data-testid="item-form-basic-info-title">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4" data-testid="item-form-basic-info-content">
                  <div className="grid grid-cols-12 gap-4" data-testid="item-form-basic-info-grid">
                    <div className="col-span-6" data-testid="item-form-name-field">
                      <Label htmlFor="name" data-testid="item-form-name-label">Product Name *</Label>
                      <Input
                        id="name"
                        ref={firstInputRef}
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter product name"
                        className={errors.name ? "border-red-500" : ""}
                        data-testid="item-form-name-input"
                      />
                      {errors.name && <p className="text-sm text-red-500 mt-1" data-testid="item-form-name-error">{errors.name}</p>}
                    </div>
                    <div className="col-span-3" data-testid="item-form-product-code-field">
                      <Label htmlFor="product_code" data-testid="item-form-product-code-label">Product Code</Label>
                      <Input
                        id="product_code"
                        value={formData.product_code}
                        onChange={(e) => handleInputChange("product_code", e.target.value)}
                        placeholder="Auto-generated"
                        data-testid="item-form-product-code-input"
                      />
                    </div>
                    <div className="col-span-3" data-testid="item-form-identifier-field">
                      <Label htmlFor="identifier" data-testid="item-form-identifier-label">Identifier</Label>
                      <Input
                        id="identifier"
                        value={formData.identifier}
                        onChange={(e) => handleInputChange("identifier", e.target.value)}
                        placeholder="Enter identifier"
                        data-testid="item-form-identifier-input"
                      />
                    </div>
                  </div>

                  <div data-testid="item-form-description-field">
                    <Label htmlFor="description" data-testid="item-form-description-label">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Enter product description"
                      rows={3}
                      data-testid="item-form-description-input"
                    />
                  </div>

                  <div className="grid grid-cols-12 gap-4" data-testid="item-form-category-grid">
                    <div className="col-span-4" data-testid="item-form-category-field">
                      <Label htmlFor="category" data-testid="item-form-category-label">Category *</Label>
                      <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)} data-testid="item-form-category-select">
                        <SelectTrigger className={errors.category ? "border-red-500" : ""} data-testid="item-form-category-trigger">
                          <SelectValue placeholder="Select category" data-testid="item-form-category-value" />
                        </SelectTrigger>
                        <SelectContent data-testid="item-form-category-content">
                          {categories.map((category, index) => (
                            <SelectItem key={category} value={category} data-testid={`item-form-category-option-${index}`}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && <p className="text-sm text-red-500 mt-1" data-testid="item-form-category-error">{errors.category}</p>}
                    </div>
                    <div className="col-span-4" data-testid="item-form-brand-field">
                      <Label htmlFor="brand" data-testid="item-form-brand-label">Brand</Label>
                      <Input
                        id="brand"
                        value={formData.brand}
                        onChange={(e) => handleInputChange("brand", e.target.value)}
                        placeholder="Enter brand name"
                        data-testid="item-form-brand-input"
                      />
                    </div>
                    <div className="col-span-4" data-testid="item-form-warehouse-field">
                      <Label htmlFor="warehouse" data-testid="item-form-warehouse-label">Warehouse</Label>
                      <Input
                        id="warehouse"
                        value={formData.warehouse}
                        onChange={(e) => handleInputChange("warehouse", e.target.value)}
                        placeholder="Enter warehouse"
                        data-testid="item-form-warehouse-input"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="item-form-manufacturer-card">
                <CardHeader data-testid="item-form-manufacturer-header">
                  <CardTitle data-testid="item-form-manufacturer-title">Manufacturer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4" data-testid="item-form-manufacturer-content">
                  <div className="grid grid-cols-12 gap-4" data-testid="item-form-manufacturer-grid">
                    <div className="col-span-4" data-testid="item-form-manufacturer-field">
                      <Label htmlFor="manufacturer" data-testid="item-form-manufacturer-label">Manufacturer *</Label>
                      <Input
                        id="manufacturer"
                        value={formData.manufacturer}
                        onChange={(e) => handleInputChange("manufacturer", e.target.value)}
                        placeholder="Enter manufacturer"
                        className={errors.manufacturer ? "border-red-500" : ""}
                        data-testid="item-form-manufacturer-input"
                      />
                      {errors.manufacturer && <p className="text-sm text-red-500 mt-1" data-testid="item-form-manufacturer-error">{errors.manufacturer}</p>}
                    </div>
                    <div className="col-span-4" data-testid="item-form-manufacturer-group-field">
                      <Label htmlFor="manufacturer_group" data-testid="item-form-manufacturer-group-label">Manufacturer Group</Label>
                      <Input
                        id="manufacturer_group"
                        value={formData.manufacturer_group}
                        onChange={(e) => handleInputChange("manufacturer_group", e.target.value)}
                        placeholder="Enter manufacturer group"
                        data-testid="item-form-manufacturer-group-input"
                      />
                    </div>
                    <div className="col-span-4" data-testid="item-form-marketed-by-field">
                      <Label htmlFor="marketed_by" data-testid="item-form-marketed-by-label">Marketed By</Label>
                      <Input
                        id="marketed_by"
                        value={formData.marketed_by}
                        onChange={(e) => handleInputChange("marketed_by", e.target.value)}
                        placeholder="Enter marketing company"
                        data-testid="item-form-marketed-by-input"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="item-form-packaging-card">
                <CardHeader data-testid="item-form-packaging-header">
                  <CardTitle data-testid="item-form-packaging-title">Packaging & Physical Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4" data-testid="item-form-packaging-content">
                  <div className="grid grid-cols-12 gap-4" data-testid="item-form-packaging-grid">
                    <div className="col-span-3" data-testid="item-form-pack-size-field">
                      <Label htmlFor="pack_size" data-testid="item-form-pack-size-label">Pack Size</Label>
                      <Input
                        id="pack_size"
                        value={formData.pack_size}
                        onChange={(e) => handleInputChange("pack_size", e.target.value)}
                        placeholder="e.g., 20 tablets"
                        data-testid="item-form-pack-size-input"
                      />
                    </div>
                    <div className="col-span-3" data-testid="item-form-unit-per-pack-field">
                      <Label htmlFor="unit_per_pack" data-testid="item-form-unit-per-pack-label">Units per Pack</Label>
                      <Input
                        id="unit_per_pack"
                        type="number"
                        value={formData.unit_per_pack}
                        onChange={(e) => handleInputChange("unit_per_pack", e.target.value)}
                        placeholder="Enter number"
                        className={errors.unit_per_pack ? "border-red-500" : ""}
                        data-testid="item-form-unit-per-pack-input"
                      />
                      {errors.unit_per_pack && <p className="text-sm text-red-500 mt-1" data-testid="item-form-unit-per-pack-error">{errors.unit_per_pack}</p>}
                    </div>
                    <div className="col-span-3" data-testid="item-form-outer-quantity-field">
                      <Label htmlFor="outer_quantity_pack" data-testid="item-form-outer-quantity-label">Outer Quantity Pack</Label>
                      <Input
                        id="outer_quantity_pack"
                        type="number"
                        value={formData.outer_quantity_pack}
                        onChange={(e) => handleInputChange("outer_quantity_pack", e.target.value)}
                        placeholder="Enter number"
                        data-testid="item-form-outer-quantity-input"
                      />
                    </div>
                    <div className="col-span-3" data-testid="item-form-unit-measurement-field">
                      <Label htmlFor="unit_measurement" data-testid="item-form-unit-measurement-label">Unit Measurement</Label>
                      <Input
                        id="unit_measurement"
                        value={formData.unit_measurement}
                        onChange={(e) => handleInputChange("unit_measurement", e.target.value)}
                        placeholder="e.g., Tablets, ml"
                        data-testid="item-form-unit-measurement-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-4" data-testid="item-form-form-grid">
                    <div className="col-span-4" data-testid="item-form-form-field">
                      <Label htmlFor="form" data-testid="item-form-form-label">Form</Label>
                      <Input
                        id="form"
                        value={formData.form}
                        onChange={(e) => handleInputChange("form", e.target.value)}
                        placeholder="e.g., Tablet, Capsule"
                        data-testid="item-form-form-input"
                      />
                    </div>
                    <div className="col-span-4" data-testid="item-form-weight-field">
                      <Label htmlFor="weight" data-testid="item-form-weight-label">Weight</Label>
                      <div className="flex gap-2" data-testid="item-form-weight-container">
                        <Input
                          id="weight"
                          type="number"
                          step="0.01"
                          value={formData.weight}
                          onChange={(e) => handleInputChange("weight", e.target.value)}
                          placeholder="0.00"
                          className={`flex-1 ${errors.weight ? "border-red-500" : ""}`}
                          data-testid="item-form-weight-input"
                        />
                        <Select value={formData.weight_unit} onValueChange={(value) => handleInputChange("weight_unit", value)} data-testid="item-form-weight-unit-select">
                          <SelectTrigger className="w-20" data-testid="item-form-weight-unit-trigger">
                            <SelectValue data-testid="item-form-weight-unit-value" />
                          </SelectTrigger>
                          <SelectContent data-testid="item-form-weight-unit-content">
                            {weightUnits.map((unit, index) => (
                              <SelectItem key={unit} value={unit} data-testid={`item-form-weight-unit-option-${index}`}>
                                {unit}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {errors.weight && <p className="text-sm text-red-500 mt-1" data-testid="item-form-weight-error">{errors.weight}</p>}
                    </div>
                    <div className="col-span-4" data-testid="item-form-color-field">
                      <Label htmlFor="color_type" data-testid="item-form-color-label">Color</Label>
                      <div className="flex gap-2" data-testid="item-form-color-container">
                        <Input
                          id="color_type"
                          type="color"
                          value={formData.color_type}
                          onChange={(e) => handleInputChange("color_type", e.target.value)}
                          className="w-12 h-10 p-1 border rounded"
                          data-testid="item-form-color-input"
                        />
                        <Input
                          value={formData.color_type}
                          onChange={(e) => handleInputChange("color_type", e.target.value)}
                          placeholder="#3b82f6"
                          className="flex-1"
                          data-testid="item-form-color-text-input"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pricing Info Tab */}
            <TabsContent value="pricing-info" className="space-y-6" data-testid="item-form-pricing-content">
              <Card data-testid="item-form-pricing-card">
                <CardHeader data-testid="item-form-pricing-header">
                  <CardTitle data-testid="item-form-pricing-title">Pricing Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4" data-testid="item-form-pricing-content-inner">
                  <div className="grid grid-cols-12 gap-4" data-testid="item-form-pricing-grid">
                    <div className="col-span-4" data-testid="item-form-sale-rate-field">
                      <Label htmlFor="sale_rate" data-testid="item-form-sale-rate-label">Sale Rate</Label>
                      <Input
                        id="sale_rate"
                        type="number"
                        step="0.01"
                        value={formData.sale_rate}
                        onChange={(e) => handleInputChange("sale_rate", e.target.value)}
                        placeholder="0.00"
                        className={errors.sale_rate ? "border-red-500" : ""}
                        data-testid="item-form-sale-rate-input"
                      />
                      {errors.sale_rate && <p className="text-sm text-red-500 mt-1" data-testid="item-form-sale-rate-error">{errors.sale_rate}</p>}
                    </div>
                    <div className="col-span-4" data-testid="item-form-box-mrp-field">
                      <Label htmlFor="box_mrp" data-testid="item-form-box-mrp-label">Box MRP</Label>
                      <Input
                        id="box_mrp"
                        type="number"
                        step="0.01"
                        value={formData.box_mrp}
                        onChange={(e) => handleInputChange("box_mrp", e.target.value)}
                        placeholder="0.00"
                        data-testid="item-form-box-mrp-input"
                      />
                    </div>
                    <div className="col-span-4" data-testid="item-form-box-ptr-field">
                      <Label htmlFor="box_ptr" data-testid="item-form-box-ptr-label">Box PTR</Label>
                      <Input
                        id="box_ptr"
                        type="number"
                        step="0.01"
                        value={formData.box_ptr}
                        onChange={(e) => handleInputChange("box_ptr", e.target.value)}
                        placeholder="0.00"
                        data-testid="item-form-box-ptr-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-4" data-testid="item-form-margin-grid">
                    <div className="col-span-6" data-testid="item-form-min-margin-sale-field">
                      <Label htmlFor="min_margin_sale" data-testid="item-form-min-margin-sale-label">Min Margin Sale (%)</Label>
                      <Input
                        id="min_margin_sale"
                        type="number"
                        step="0.01"
                        value={formData.min_margin_sale}
                        onChange={(e) => handleInputChange("min_margin_sale", e.target.value)}
                        placeholder="0.00"
                        data-testid="item-form-min-margin-sale-input"
                      />
                    </div>
                    <div className="col-span-6" data-testid="item-form-min-margin-purchase-field">
                      <Label htmlFor="min_margin_purchase" data-testid="item-form-min-margin-purchase-label">Min Margin Purchase (%)</Label>
                      <Input
                        id="min_margin_purchase"
                        type="number"
                        step="0.01"
                        value={formData.min_margin_purchase}
                        onChange={(e) => handleInputChange("min_margin_purchase", e.target.value)}
                        placeholder="0.00"
                        data-testid="item-form-min-margin-purchase-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-4" data-testid="item-form-discount-grid">
                    <div className="col-span-4" data-testid="item-form-max-discount-field">
                      <Label htmlFor="max_discount" data-testid="item-form-max-discount-label">Max Discount (%)</Label>
                      <Input
                        id="max_discount"
                        type="number"
                        step="0.01"
                        value={formData.max_discount}
                        onChange={(e) => handleInputChange("max_discount", e.target.value)}
                        placeholder="0.00"
                        data-testid="item-form-max-discount-input"
                      />
                    </div>
                    <div className="col-span-4" data-testid="item-form-discount-field">
                      <Label htmlFor="discount" data-testid="item-form-discount-label">Discount (%)</Label>
                      <Input
                        id="discount"
                        type="number"
                        step="0.01"
                        value={formData.discount}
                        onChange={(e) => handleInputChange("discount", e.target.value)}
                        placeholder="0.00"
                        data-testid="item-form-discount-input"
                      />
                    </div>
                    <div className="col-span-4" data-testid="item-form-box-discount-field">
                      <Label htmlFor="box_discount" data-testid="item-form-box-discount-label">Box Discount (%)</Label>
                      <Input
                        id="box_discount"
                        type="number"
                        step="0.01"
                        value={formData.box_discount}
                        onChange={(e) => handleInputChange("box_discount", e.target.value)}
                        placeholder="0.00"
                        data-testid="item-form-box-discount-input"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="item-form-tax-card">
                <CardHeader data-testid="item-form-tax-header">
                  <CardTitle data-testid="item-form-tax-title">Tax & Compliance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4" data-testid="item-form-tax-content">
                  <div className="grid grid-cols-12 gap-4" data-testid="item-form-tax-grid">
                    <div className="col-span-6" data-testid="item-form-hsn-sac-field">
                      <Label htmlFor="hsn_sac" data-testid="item-form-hsn-sac-label">HSN/SAC Code</Label>
                      <Input
                        id="hsn_sac"
                        value={formData.hsn_sac}
                        onChange={(e) => handleInputChange("hsn_sac", e.target.value)}
                        placeholder="Enter HSN/SAC code"
                        data-testid="item-form-hsn-sac-input"
                      />
                    </div>
                    <div className="col-span-6" data-testid="item-form-tax-category-field">
                      <Label htmlFor="tax_category" data-testid="item-form-tax-category-label">Tax Category</Label>
                      <Select value={formData.tax_category} onValueChange={(value) => handleInputChange("tax_category", value)} data-testid="item-form-tax-category-select">
                        <SelectTrigger data-testid="item-form-tax-category-trigger">
                          <SelectValue data-testid="item-form-tax-category-value" />
                        </SelectTrigger>
                        <SelectContent data-testid="item-form-tax-category-content">
                          {taxCategories.map((category, index) => (
                            <SelectItem key={category} value={category} data-testid={`item-form-tax-category-option-${index}`}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-4" data-testid="item-form-scheme-grid">
                    <div className="col-span-6" data-testid="item-form-scheme-type-field">
                      <Label htmlFor="scheme_type" data-testid="item-form-scheme-type-label">Scheme Type</Label>
                      <Select value={formData.scheme_type} onValueChange={(value) => handleInputChange("scheme_type", value)} data-testid="item-form-scheme-type-select">
                        <SelectTrigger data-testid="item-form-scheme-type-trigger">
                          <SelectValue data-testid="item-form-scheme-type-value" />
                        </SelectTrigger>
                        <SelectContent data-testid="item-form-scheme-type-content">
                          {schemeTypes.map((type, index) => (
                            <SelectItem key={type} value={type} data-testid={`item-form-scheme-type-option-${index}`}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-6" data-testid="item-form-force-sp-field">
                      <Label htmlFor="force_sp" data-testid="item-form-force-sp-label">Force SP</Label>
                      <Input
                        id="force_sp"
                        type="number"
                        step="0.01"
                        value={formData.force_sp || ""}
                        onChange={(e) => handleInputChange("force_sp", e.target.value ? Number(e.target.value) : null)}
                        placeholder="Optional"
                        data-testid="item-form-force-sp-input"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Additional Info Tab */}
            <TabsContent value="additional-info" className="space-y-6" data-testid="item-form-additional-content">
              <Card data-testid="item-form-medical-card">
                <CardHeader data-testid="item-form-medical-header">
                  <CardTitle data-testid="item-form-medical-title">Medical Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4" data-testid="item-form-medical-content">
                  <div className="grid grid-cols-12 gap-4" data-testid="item-form-medical-grid">
                    <div className="col-span-4" data-testid="item-form-schedule-type-field">
                      <Label htmlFor="schedule_type" data-testid="item-form-schedule-type-label">Schedule Type</Label>
                      <Select value={formData.schedule_type} onValueChange={(value) => handleInputChange("schedule_type", value)} data-testid="item-form-schedule-type-select">
                        <SelectTrigger data-testid="item-form-schedule-type-trigger">
                          <SelectValue placeholder="Select schedule" data-testid="item-form-schedule-type-value" />
                        </SelectTrigger>
                        <SelectContent data-testid="item-form-schedule-type-content">
                          {scheduleTypes.map((type, index) => (
                            <SelectItem key={type} value={type} data-testid={`item-form-schedule-type-option-${index}`}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-4" data-testid="item-form-therapeutic-field">
                      <Label htmlFor="therapeutic" data-testid="item-form-therapeutic-label">Therapeutic</Label>
                      <Input
                        id="therapeutic"
                        value={formData.therapeutic}
                        onChange={(e) => handleInputChange("therapeutic", e.target.value)}
                        placeholder="Enter therapeutic class"
                        data-testid="item-form-therapeutic-input"
                      />
                    </div>
                    <div className="col-span-4" data-testid="item-form-sub-therapeutic-field">
                      <Label htmlFor="sub_therapeutic" data-testid="item-form-sub-therapeutic-label">Sub Therapeutic</Label>
                      <Input
                        id="sub_therapeutic"
                        value={formData.sub_therapeutic}
                        onChange={(e) => handleInputChange("sub_therapeutic", e.target.value)}
                        placeholder="Enter sub therapeutic"
                        data-testid="item-form-sub-therapeutic-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-4" data-testid="item-form-storage-grid">
                    <div className="col-span-6" data-testid="item-form-storage-type-field">
                      <Label htmlFor="storage_type" data-testid="item-form-storage-type-label">Storage Type</Label>
                      <Select value={formData.storage_type} onValueChange={(value) => handleInputChange("storage_type", value)} data-testid="item-form-storage-type-select">
                        <SelectTrigger data-testid="item-form-storage-type-trigger">
                          <SelectValue data-testid="item-form-storage-type-value" />
                        </SelectTrigger>
                        <SelectContent data-testid="item-form-storage-type-content">
                          {storageTypes.map((type, index) => (
                            <SelectItem key={type} value={type} data-testid={`item-form-storage-type-option-${index}`}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-6" data-testid="item-form-max-quantity-field">
                      <Label htmlFor="max_quantity_return_expiry" data-testid="item-form-max-quantity-label">Max Quantity Return Expiry</Label>
                      <Input
                        id="max_quantity_return_expiry"
                        type="number"
                        value={formData.max_quantity_return_expiry}
                        onChange={(e) => handleInputChange("max_quantity_return_expiry", e.target.value)}
                        placeholder="Enter quantity"
                        data-testid="item-form-max-quantity-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-4" data-testid="item-form-rack-grid">
                    <div className="col-span-6" data-testid="item-form-primary-rack-field">
                      <Label htmlFor="primary_rack" data-testid="item-form-primary-rack-label">Primary Rack</Label>
                      <Input
                        id="primary_rack"
                        value={formData.primary_rack}
                        onChange={(e) => handleInputChange("primary_rack", e.target.value)}
                        placeholder="e.g., A1-01"
                        data-testid="item-form-primary-rack-input"
                      />
                    </div>
                    <div className="col-span-6" data-testid="item-form-secondary-rack-field">
                      <Label htmlFor="secondary_rack" data-testid="item-form-secondary-rack-label">Secondary Rack</Label>
                      <Input
                        id="secondary_rack"
                        value={formData.secondary_rack}
                        onChange={(e) => handleInputChange("secondary_rack", e.target.value)}
                        placeholder="e.g., B2-05"
                        data-testid="item-form-secondary-rack-input"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="item-form-composition-card">
                <CardHeader data-testid="item-form-composition-header">
                  <CardTitle data-testid="item-form-composition-title">Composition</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4" data-testid="item-form-composition-content">
                  <div data-testid="item-form-salt-molecule-field">
                    <Label data-testid="item-form-salt-molecule-label">Salt/Molecule</Label>
                    <div className="space-y-2" data-testid="item-form-salt-molecule-list">
                      {formData.salt_molecule.map((item, index) => (
                        <div key={index} className="flex gap-2" data-testid={`item-form-salt-molecule-item-${index}`}>
                          <Input
                            value={item}
                            onChange={(e) => handleArrayChange("salt_molecule", index, e.target.value)}
                            placeholder="Enter salt/molecule"
                            className="flex-1"
                            data-testid={`item-form-salt-molecule-input-${index}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeArrayItem("salt_molecule", index)}
                            data-testid={`item-form-salt-molecule-remove-${index}`}
                          >
                            <X className="h-4 w-4" data-testid={`item-form-salt-molecule-remove-icon-${index}`} />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addArrayItem("salt_molecule")}
                        data-testid="item-form-salt-molecule-add"
                      >
                        Add Salt/Molecule
                      </Button>
                    </div>
                  </div>

                  <div data-testid="item-form-content-field">
                    <Label data-testid="item-form-content-label">Content</Label>
                    <div className="space-y-2" data-testid="item-form-content-list">
                      {formData.content.map((item, index) => (
                        <div key={index} className="flex gap-2" data-testid={`item-form-content-item-${index}`}>
                          <Input
                            value={item}
                            onChange={(e) => handleArrayChange("content", index, e.target.value)}
                            placeholder="Enter content"
                            className="flex-1"
                            data-testid={`item-form-content-input-${index}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeArrayItem("content", index)}
                            data-testid={`item-form-content-remove-${index}`}
                          >
                            <X className="h-4 w-4" data-testid={`item-form-content-remove-icon-${index}`} />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addArrayItem("content")}
                        data-testid="item-form-content-add"
                      >
                        Add Content
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6" data-testid="item-form-settings-content">
              <Card data-testid="item-form-stock-card">
                <CardHeader data-testid="item-form-stock-header">
                  <CardTitle data-testid="item-form-stock-title">Stock Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4" data-testid="item-form-stock-content">
                  <div className="grid grid-cols-12 gap-4" data-testid="item-form-stock-grid">
                    <div className="col-span-3" data-testid="item-form-min-stock-field">
                      <Label htmlFor="min_stock" data-testid="item-form-min-stock-label">Min Stock</Label>
                      <Input
                        id="min_stock"
                        type="number"
                        value={formData.min_stock}
                        onChange={(e) => handleInputChange("min_stock", e.target.value)}
                        placeholder="0"
                        data-testid="item-form-min-stock-input"
                      />
                    </div>
                    <div className="col-span-3" data-testid="item-form-max-stock-field">
                      <Label htmlFor="max_stock" data-testid="item-form-max-stock-label">Max Stock</Label>
                      <Input
                        id="max_stock"
                        type="number"
                        value={formData.max_stock}
                        onChange={(e) => handleInputChange("max_stock", e.target.value)}
                        placeholder="0"
                        data-testid="item-form-max-stock-input"
                      />
                    </div>
                    <div className="col-span-3" data-testid="item-form-sales-days-field">
                      <Label htmlFor="sales_days" data-testid="item-form-sales-days-label">Sales Days</Label>
                      <Input
                        id="sales_days"
                        type="number"
                        value={formData.sales_days}
                        onChange={(e) => handleInputChange("sales_days", e.target.value)}
                        placeholder="0"
                        data-testid="item-form-sales-days-input"
                      />
                    </div>
                    <div className="col-span-3" data-testid="item-form-expiry-days-field">
                      <Label htmlFor="expiry_days" data-testid="item-form-expiry-days-label">Expiry Days</Label>
                      <Input
                        id="expiry_days"
                        type="number"
                        value={formData.expiry_days}
                        onChange={(e) => handleInputChange("expiry_days", e.target.value)}
                        placeholder="0"
                        data-testid="item-form-expiry-days-input"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="item-form-flags-card">
                <CardHeader data-testid="item-form-flags-header">
                  <CardTitle data-testid="item-form-flags-title">Item Flags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4" data-testid="item-form-flags-content">
                  <div className="grid grid-cols-12 gap-4" data-testid="item-form-flags-grid">
                    <div className="col-span-4 flex items-center space-x-2" data-testid="item-form-loose-sale-field">
                      <Switch
                        id="loose_sale"
                        checked={formData.loose_sale}
                        onCheckedChange={(checked) => handleInputChange("loose_sale", checked)}
                        data-testid="item-form-loose-sale-switch"
                      />
                      <Label htmlFor="loose_sale" data-testid="item-form-loose-sale-label">Loose Sale</Label>
                    </div>
                    <div className="col-span-4 flex items-center space-x-2" data-testid="item-form-prescription-field">
                      <Switch
                        id="prescription_required"
                        checked={formData.prescription_required}
                        onCheckedChange={(checked) => handleInputChange("prescription_required", checked)}
                        data-testid="item-form-prescription-switch"
                      />
                      <Label htmlFor="prescription_required" data-testid="item-form-prescription-label">Prescription Required</Label>
                    </div>
                    <div className="col-span-4 flex items-center space-x-2" data-testid="item-form-allow-discount-field">
                      <Switch
                        id="allow_discount"
                        checked={formData.allow_discount}
                        onCheckedChange={(checked) => handleInputChange("allow_discount", checked)}
                        data-testid="item-form-allow-discount-switch"
                      />
                      <Label htmlFor="allow_discount" data-testid="item-form-allow-discount-label">Allow Discount</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-4" data-testid="item-form-flags-grid-2">
                    <div className="col-span-4 flex items-center space-x-2" data-testid="item-form-chronic-field">
                      <Switch
                        id="is_chronic"
                        checked={formData.is_chronic}
                        onCheckedChange={(checked) => handleInputChange("is_chronic", checked)}
                        data-testid="item-form-chronic-switch"
                      />
                      <Label htmlFor="is_chronic" data-testid="item-form-chronic-label">Is Chronic</Label>
                    </div>
                    <div className="col-span-4 flex items-center space-x-2" data-testid="item-form-tb-field">
                      <Switch
                        id="is_tb"
                        checked={formData.is_tb}
                        onCheckedChange={(checked) => handleInputChange("is_tb", checked)}
                        data-testid="item-form-tb-switch"
                      />
                      <Label htmlFor="is_tb" data-testid="item-form-tb-label">Is TB</Label>
                    </div>
                    <div className="col-span-4 flex items-center space-x-2" data-testid="item-form-dpco-field">
                      <Switch
                        id="is_dpco"
                        checked={formData.is_dpco}
                        onCheckedChange={(checked) => handleInputChange("is_dpco", checked)}
                        data-testid="item-form-dpco-switch"
                      />
                      <Label htmlFor="is_dpco" data-testid="item-form-dpco-label">Is DPCO</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-4" data-testid="item-form-flags-grid-3">
                    <div className="col-span-4 flex items-center space-x-2" data-testid="item-form-returnable-field">
                      <Switch
                        id="is_returnable"
                        checked={formData.is_returnable}
                        onCheckedChange={(checked) => handleInputChange("is_returnable", checked)}
                        data-testid="item-form-returnable-switch"
                      />
                      <Label htmlFor="is_returnable" data-testid="item-form-returnable-label">Is Returnable</Label>
                    </div>
                    <div className="col-span-4 flex items-center space-x-2" data-testid="item-form-active-field">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                        data-testid="item-form-active-switch"
                      />
                      <Label htmlFor="is_active" data-testid="item-form-active-label">Is Active</Label>
                    </div>
                    <div className="col-span-4 flex items-center space-x-2" data-testid="item-form-lock-po-field">
                      <Switch
                        id="lock_po_purchase"
                        checked={formData.lock_po_purchase}
                        onCheckedChange={(checked) => handleInputChange("lock_po_purchase", checked)}
                        data-testid="item-form-lock-po-switch"
                      />
                      <Label htmlFor="lock_po_purchase" data-testid="item-form-lock-po-label">Lock PO Purchase</Label>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-4" data-testid="item-form-flags-grid-4">
                    <div className="col-span-4 flex items-center space-x-2" data-testid="item-form-skip-apo-field">
                      <Switch
                        id="skip_from_apo"
                        checked={formData.skip_from_apo}
                        onCheckedChange={(checked) => handleInputChange("skip_from_apo", checked)}
                        data-testid="item-form-skip-apo-switch"
                      />
                      <Label htmlFor="skip_from_apo" data-testid="item-form-skip-apo-label">Skip from APO</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}