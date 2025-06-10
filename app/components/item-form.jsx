"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Save, ArrowLeft, Package, AlertCircle } from "lucide-react";
import { apiService } from "./api-service";

export function ItemForm({ mode = "create", initialData = null, onClose }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Form state - organized by sections
  const [formData, setFormData] = useState({
    // Basic Product Details
    name: "",
    description: "",
    category: "",
    brand: "",
    manufacturer: "",
    marketed_by: "",
    
    // Pack & Form Details
    pack_size: "",
    unit_per_pack: "",
    unit_measurement: "",
    form: "",
    loose_sale: false,
    outer_quantity_pack: "",
    
    // Tax & HSN Information
    hsn_sac: "",
    tax_category: "",
    is_dpco: false,
    
    // Pricing & Margins
    sale_rate: "",
    min_margin_sale: "",
    min_margin_purchase: "",
    box_mrp: "",
    box_ptr: "",
    force_sp: "",
    
    // Discount & Scheme
    scheme_type: "",
    allow_discount: false,
    max_discount: "",
    discount: "",
    box_discount: "",
    
    // Storage & Location
    warehouse: "",
    primary_rack: "",
    secondary_rack: "",
    storage_type: "",
    
    // Stock & Days
    min_stock: "",
    max_stock: "",
    sales_days: "",
    expiry_days: "",
    max_quantity_return_expiry: "",
    
    // Salt/Molecule & Content
    salt_molecule: "",
    content: "",
    therapeutic: "",
    sub_therapeutic: "",
    weight: "",
    weight_unit: "",
    
    // Additional Settings
    schedule_type: "",
    prescription_required: false,
    is_chronic: false,
    is_tb: false,
    is_active: true,
    is_returnable: true,
    lock_po_purchase: false,
    skip_from_apo: false,
    color_type: "#3b82f6",
    substitute_for: "",
  });

  // Load initial data for edit mode
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        category: initialData.category || "",
        brand: initialData.brand || "",
        manufacturer: initialData.manufacturer || "",
        marketed_by: initialData.marketed_by || "",
        pack_size: initialData.pack_size || "",
        unit_per_pack: initialData.unit_per_pack?.toString() || "",
        unit_measurement: initialData.unit_measurement || "",
        form: initialData.form || "",
        loose_sale: initialData.loose_sale || false,
        outer_quantity_pack: initialData.outer_quantity_pack?.toString() || "",
        hsn_sac: initialData.hsn_sac || "",
        tax_category: initialData.tax_category || "",
        is_dpco: initialData.is_dpco || false,
        sale_rate: initialData.sale_rate?.toString() || "",
        min_margin_sale: initialData.min_margin_sale?.toString() || "",
        min_margin_purchase: initialData.min_margin_purchase?.toString() || "",
        box_mrp: initialData.box_mrp?.toString() || "",
        box_ptr: initialData.box_ptr?.toString() || "",
        force_sp: initialData.force_sp?.toString() || "",
        scheme_type: initialData.scheme_type || "",
        allow_discount: initialData.allow_discount || false,
        max_discount: initialData.max_discount?.toString() || "",
        discount: initialData.discount?.toString() || "",
        box_discount: initialData.box_discount?.toString() || "",
        warehouse: initialData.warehouse || "",
        primary_rack: initialData.primary_rack || "",
        secondary_rack: initialData.secondary_rack || "",
        storage_type: initialData.storage_type || "",
        min_stock: initialData.min_stock?.toString() || "",
        max_stock: initialData.max_stock?.toString() || "",
        sales_days: initialData.sales_days?.toString() || "",
        expiry_days: initialData.expiry_days?.toString() || "",
        max_quantity_return_expiry: initialData.max_quantity_return_expiry?.toString() || "",
        salt_molecule: Array.isArray(initialData.salt_molecule) ? initialData.salt_molecule.join(", ") : "",
        content: Array.isArray(initialData.content) ? initialData.content.join(", ") : "",
        therapeutic: initialData.therapeutic || "",
        sub_therapeutic: initialData.sub_therapeutic || "",
        weight: initialData.weight?.toString() || "",
        weight_unit: initialData.weight_unit || "",
        schedule_type: initialData.schedule_type || "",
        prescription_required: initialData.prescription_required || false,
        is_chronic: initialData.is_chronic || false,
        is_tb: initialData.is_tb || false,
        is_active: initialData.is_active !== undefined ? initialData.is_active : true,
        is_returnable: initialData.is_returnable !== undefined ? initialData.is_returnable : true,
        lock_po_purchase: initialData.lock_po_purchase || false,
        skip_from_apo: initialData.skip_from_apo || false,
        color_type: initialData.color_type || "#3b82f6",
        substitute_for: initialData.substitute_for || "",
      });
    }
  }, [mode, initialData]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }
    
    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }
    
    if (!formData.hsn_sac.trim()) {
      newErrors.hsn_sac = "HSN/SAC code is required";
    }
    
    if (!formData.sale_rate || isNaN(parseFloat(formData.sale_rate))) {
      newErrors.sale_rate = "Valid sale rate is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Prepare data for API
      const apiData = {
        ...formData,
        unit_per_pack: parseInt(formData.unit_per_pack) || 0,
        outer_quantity_pack: parseInt(formData.outer_quantity_pack) || 0,
        sale_rate: parseFloat(formData.sale_rate) || 0,
        min_margin_sale: parseFloat(formData.min_margin_sale) || 0,
        min_margin_purchase: parseFloat(formData.min_margin_purchase) || 0,
        box_mrp: parseFloat(formData.box_mrp) || 0,
        box_ptr: parseFloat(formData.box_ptr) || 0,
        force_sp: formData.force_sp ? parseFloat(formData.force_sp) : null,
        max_discount: parseFloat(formData.max_discount) || 0,
        discount: parseFloat(formData.discount) || 0,
        box_discount: parseFloat(formData.box_discount) || 0,
        min_stock: parseInt(formData.min_stock) || 0,
        max_stock: parseInt(formData.max_stock) || 0,
        sales_days: parseInt(formData.sales_days) || 0,
        expiry_days: parseInt(formData.expiry_days) || 0,
        max_quantity_return_expiry: parseInt(formData.max_quantity_return_expiry) || 0,
        weight: parseFloat(formData.weight) || 0,
        salt_molecule: formData.salt_molecule.split(",").map(s => s.trim()).filter(s => s),
        content: formData.content.split(",").map(s => s.trim()).filter(s => s),
        price: parseFloat(formData.sale_rate) || 0, // Legacy field
      };
      
      let response;
      if (mode === "edit" && initialData?.id) {
        response = await apiService.updateItem(initialData.id, apiData);
      } else {
        response = await apiService.createItem(apiData);
      }
      
      if (response.success) {
        navigate("/items");
      } else {
        setErrors({ submit: response.error || "Failed to save item" });
      }
    } catch (error) {
      setErrors({ submit: "An error occurred while saving the item" });
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onClose) {
      onClose();
    } else {
      navigate("/items");
    }
  };

  // Dropdown options
  const categories = [
    "Analgesics", "Antibiotics", "Diabetes Care", "Gastroenterology", "Respiratory",
    "Antihistamines", "Cardiovascular", "Dermatology", "Neurology", "Oncology"
  ];
  
  const storageTypes = ["Room Temperature", "Refrigerated", "Frozen", "Controlled"];
  const scheduleTypes = ["Schedule H", "Schedule H1", "No Narcotics", "OTC"];
  const taxCategories = ["GST Sale - 5%", "GST Sale - 12%", "GST Sale - 18%", "GST Sale - 28%"];
  const schemeTypes = ["Standard", "Dynamic", "Half Scheme"];
  const unitMeasurements = ["Tablets", "Capsules", "ml", "grams", "Units"];
  const weightUnits = ["grams", "kg", "mg"];

  return (
    <div className="h-full overflow-auto bg-background" data-testid="item-form">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between" data-testid="item-form-header">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="h-8 w-8 p-0"
              data-testid="item-form-back-button"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold" data-testid="item-form-title">
                {mode === "edit" ? "Edit Item" : "Add New Item"}
              </h1>
              <p className="text-muted-foreground" data-testid="item-form-subtitle">
                {mode === "edit" ? "Update item information" : "Create a new item in your inventory"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              data-testid="item-form-cancel-button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="min-w-[100px]"
              data-testid="item-form-save-button"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {mode === "edit" ? "Update" : "Save"}
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {errors.submit && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4" data-testid="item-form-error">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">{errors.submit}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Product Details */}
          <Card data-testid="basic-product-details-section">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                Basic Product Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="name" className="w-32 text-sm font-medium">Product Name *</Label>
                  <div className="flex-1">
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter product name"
                      className={errors.name ? "border-destructive" : ""}
                      data-testid="item-form-name-input"
                    />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="category" className="w-32 text-sm font-medium">Category *</Label>
                  <div className="flex-1">
                    <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                      <SelectTrigger className={errors.category ? "border-destructive" : ""} data-testid="item-form-category-select">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Label htmlFor="description" className="w-32 text-sm font-medium pt-2">Description</Label>
                <div className="flex-1">
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Enter product description"
                    rows={3}
                    data-testid="item-form-description-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="brand" className="w-32 text-sm font-medium">Brand</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => handleInputChange("brand", e.target.value)}
                    placeholder="Enter brand name"
                    className="flex-1"
                    data-testid="item-form-brand-input"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="manufacturer" className="w-32 text-sm font-medium">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => handleInputChange("manufacturer", e.target.value)}
                    placeholder="Enter manufacturer"
                    className="flex-1"
                    data-testid="item-form-manufacturer-input"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Label htmlFor="marketed_by" className="w-32 text-sm font-medium">Marketed By</Label>
                <Input
                  id="marketed_by"
                  value={formData.marketed_by}
                  onChange={(e) => handleInputChange("marketed_by", e.target.value)}
                  placeholder="Enter marketing company"
                  className="flex-1"
                  data-testid="item-form-marketed-by-input"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pack & Form Details */}
          <Card data-testid="pack-form-details-section">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Pack & Form Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="pack_size" className="w-32 text-sm font-medium">Pack Size</Label>
                  <Input
                    id="pack_size"
                    value={formData.pack_size}
                    onChange={(e) => handleInputChange("pack_size", e.target.value)}
                    placeholder="e.g., 10 tablets"
                    className="flex-1"
                    data-testid="item-form-pack-size-input"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="unit_per_pack" className="w-32 text-sm font-medium">Units per Pack</Label>
                  <Input
                    id="unit_per_pack"
                    type="number"
                    value={formData.unit_per_pack}
                    onChange={(e) => handleInputChange("unit_per_pack", e.target.value)}
                    placeholder="Enter number"
                    className="flex-1"
                    data-testid="item-form-unit-per-pack-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="unit_measurement" className="w-32 text-sm font-medium">Unit Measurement</Label>
                  <Select value={formData.unit_measurement} onValueChange={(value) => handleInputChange("unit_measurement", value)}>
                    <SelectTrigger className="flex-1" data-testid="item-form-unit-measurement-select">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitMeasurements.map((unit) => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="form" className="w-32 text-sm font-medium">Form</Label>
                  <Input
                    id="form"
                    value={formData.form}
                    onChange={(e) => handleInputChange("form", e.target.value)}
                    placeholder="e.g., Tablet, Capsule"
                    className="flex-1"
                    data-testid="item-form-form-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="loose_sale" className="w-32 text-sm font-medium">Loose Sale</Label>
                  <Switch
                    id="loose_sale"
                    checked={formData.loose_sale}
                    onCheckedChange={(checked) => handleInputChange("loose_sale", checked)}
                    data-testid="item-form-loose-sale-switch"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="outer_quantity_pack" className="w-32 text-sm font-medium">Outer Qty Pack</Label>
                  <Input
                    id="outer_quantity_pack"
                    type="number"
                    value={formData.outer_quantity_pack}
                    onChange={(e) => handleInputChange("outer_quantity_pack", e.target.value)}
                    placeholder="Enter quantity"
                    className="flex-1"
                    data-testid="item-form-outer-quantity-pack-input"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax & HSN Information */}
          <Card data-testid="tax-hsn-information-section">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Tax & HSN Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="hsn_sac" className="w-32 text-sm font-medium">HSN/SAC Code *</Label>
                  <div className="flex-1">
                    <Input
                      id="hsn_sac"
                      value={formData.hsn_sac}
                      onChange={(e) => handleInputChange("hsn_sac", e.target.value)}
                      placeholder="Enter HSN/SAC code"
                      className={errors.hsn_sac ? "border-destructive" : ""}
                      data-testid="item-form-hsn-sac-input"
                    />
                    {errors.hsn_sac && <p className="text-xs text-destructive mt-1">{errors.hsn_sac}</p>}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="tax_category" className="w-32 text-sm font-medium">Tax Category</Label>
                  <Select value={formData.tax_category} onValueChange={(value) => handleInputChange("tax_category", value)}>
                    <SelectTrigger className="flex-1" data-testid="item-form-tax-category-select">
                      <SelectValue placeholder="Select tax category" />
                    </SelectTrigger>
                    <SelectContent>
                      {taxCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Label htmlFor="is_dpco" className="w-32 text-sm font-medium">DPCO</Label>
                <Switch
                  id="is_dpco"
                  checked={formData.is_dpco}
                  onCheckedChange={(checked) => handleInputChange("is_dpco", checked)}
                  data-testid="item-form-is-dpco-switch"
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Margins */}
          <Card data-testid="pricing-margins-section">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Pricing & Margins</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="sale_rate" className="w-32 text-sm font-medium">Sale Rate *</Label>
                  <div className="flex-1">
                    <Input
                      id="sale_rate"
                      type="number"
                      step="0.01"
                      value={formData.sale_rate}
                      onChange={(e) => handleInputChange("sale_rate", e.target.value)}
                      placeholder="0.00"
                      className={errors.sale_rate ? "border-destructive" : ""}
                      data-testid="item-form-sale-rate-input"
                    />
                    {errors.sale_rate && <p className="text-xs text-destructive mt-1">{errors.sale_rate}</p>}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="min_margin_sale" className="w-32 text-sm font-medium">Min Margin Sale %</Label>
                  <Input
                    id="min_margin_sale"
                    type="number"
                    step="0.01"
                    value={formData.min_margin_sale}
                    onChange={(e) => handleInputChange("min_margin_sale", e.target.value)}
                    placeholder="0.00"
                    className="flex-1"
                    data-testid="item-form-min-margin-sale-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="min_margin_purchase" className="w-32 text-sm font-medium">Min Margin Purchase %</Label>
                  <Input
                    id="min_margin_purchase"
                    type="number"
                    step="0.01"
                    value={formData.min_margin_purchase}
                    onChange={(e) => handleInputChange("min_margin_purchase", e.target.value)}
                    placeholder="0.00"
                    className="flex-1"
                    data-testid="item-form-min-margin-purchase-input"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="box_mrp" className="w-32 text-sm font-medium">Box MRP</Label>
                  <Input
                    id="box_mrp"
                    type="number"
                    step="0.01"
                    value={formData.box_mrp}
                    onChange={(e) => handleInputChange("box_mrp", e.target.value)}
                    placeholder="0.00"
                    className="flex-1"
                    data-testid="item-form-box-mrp-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="box_ptr" className="w-32 text-sm font-medium">Box PTR</Label>
                  <Input
                    id="box_ptr"
                    type="number"
                    step="0.01"
                    value={formData.box_ptr}
                    onChange={(e) => handleInputChange("box_ptr", e.target.value)}
                    placeholder="0.00"
                    className="flex-1"
                    data-testid="item-form-box-ptr-input"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="force_sp" className="w-32 text-sm font-medium">Force SP</Label>
                  <Input
                    id="force_sp"
                    type="number"
                    step="0.01"
                    value={formData.force_sp}
                    onChange={(e) => handleInputChange("force_sp", e.target.value)}
                    placeholder="0.00"
                    className="flex-1"
                    data-testid="item-form-force-sp-input"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discount & Scheme */}
          <Card data-testid="discount-scheme-section">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Discount & Scheme</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="scheme_type" className="w-32 text-sm font-medium">Scheme Type</Label>
                  <Select value={formData.scheme_type} onValueChange={(value) => handleInputChange("scheme_type", value)}>
                    <SelectTrigger className="flex-1" data-testid="item-form-scheme-type-select">
                      <SelectValue placeholder="Select scheme type" />
                    </SelectTrigger>
                    <SelectContent>
                      {schemeTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="allow_discount" className="w-32 text-sm font-medium">Allow Discount</Label>
                  <Switch
                    id="allow_discount"
                    checked={formData.allow_discount}
                    onCheckedChange={(checked) => handleInputChange("allow_discount", checked)}
                    data-testid="item-form-allow-discount-switch"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="max_discount" className="w-32 text-sm font-medium">Max Discount %</Label>
                  <Input
                    id="max_discount"
                    type="number"
                    step="0.01"
                    value={formData.max_discount}
                    onChange={(e) => handleInputChange("max_discount", e.target.value)}
                    placeholder="0.00"
                    className="flex-1"
                    data-testid="item-form-max-discount-input"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="discount" className="w-32 text-sm font-medium">Discount %</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.01"
                    value={formData.discount}
                    onChange={(e) => handleInputChange("discount", e.target.value)}
                    placeholder="0.00"
                    className="flex-1"
                    data-testid="item-form-discount-input"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="box_discount" className="w-32 text-sm font-medium">Box Discount %</Label>
                  <Input
                    id="box_discount"
                    type="number"
                    step="0.01"
                    value={formData.box_discount}
                    onChange={(e) => handleInputChange("box_discount", e.target.value)}
                    placeholder="0.00"
                    className="flex-1"
                    data-testid="item-form-box-discount-input"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Storage & Location */}
          <Card data-testid="storage-location-section">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Storage & Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="warehouse" className="w-32 text-sm font-medium">Warehouse</Label>
                  <Input
                    id="warehouse"
                    value={formData.warehouse}
                    onChange={(e) => handleInputChange("warehouse", e.target.value)}
                    placeholder="Enter warehouse"
                    className="flex-1"
                    data-testid="item-form-warehouse-input"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="storage_type" className="w-32 text-sm font-medium">Storage Type</Label>
                  <Select value={formData.storage_type} onValueChange={(value) => handleInputChange("storage_type", value)}>
                    <SelectTrigger className="flex-1" data-testid="item-form-storage-type-select">
                      <SelectValue placeholder="Select storage type" />
                    </SelectTrigger>
                    <SelectContent>
                      {storageTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="primary_rack" className="w-32 text-sm font-medium">Primary Rack</Label>
                  <Input
                    id="primary_rack"
                    value={formData.primary_rack}
                    onChange={(e) => handleInputChange("primary_rack", e.target.value)}
                    placeholder="e.g., A1-01"
                    className="flex-1"
                    data-testid="item-form-primary-rack-input"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="secondary_rack" className="w-32 text-sm font-medium">Secondary Rack</Label>
                  <Input
                    id="secondary_rack"
                    value={formData.secondary_rack}
                    onChange={(e) => handleInputChange("secondary_rack", e.target.value)}
                    placeholder="e.g., B2-05"
                    className="flex-1"
                    data-testid="item-form-secondary-rack-input"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock & Days */}
          <Card data-testid="stock-days-section">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Stock & Days</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="min_stock" className="w-32 text-sm font-medium">Min Stock</Label>
                  <Input
                    id="min_stock"
                    type="number"
                    value={formData.min_stock}
                    onChange={(e) => handleInputChange("min_stock", e.target.value)}
                    placeholder="0"
                    className="flex-1"
                    data-testid="item-form-min-stock-input"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="max_stock" className="w-32 text-sm font-medium">Max Stock</Label>
                  <Input
                    id="max_stock"
                    type="number"
                    value={formData.max_stock}
                    onChange={(e) => handleInputChange("max_stock", e.target.value)}
                    placeholder="0"
                    className="flex-1"
                    data-testid="item-form-max-stock-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="sales_days" className="w-32 text-sm font-medium">Sales Days</Label>
                  <Input
                    id="sales_days"
                    type="number"
                    value={formData.sales_days}
                    onChange={(e) => handleInputChange("sales_days", e.target.value)}
                    placeholder="0"
                    className="flex-1"
                    data-testid="item-form-sales-days-input"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="expiry_days" className="w-32 text-sm font-medium">Expiry Days</Label>
                  <Input
                    id="expiry_days"
                    type="number"
                    value={formData.expiry_days}
                    onChange={(e) => handleInputChange("expiry_days", e.target.value)}
                    placeholder="0"
                    className="flex-1"
                    data-testid="item-form-expiry-days-input"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="max_quantity_return_expiry" className="w-32 text-sm font-medium">Max Qty Return</Label>
                  <Input
                    id="max_quantity_return_expiry"
                    type="number"
                    value={formData.max_quantity_return_expiry}
                    onChange={(e) => handleInputChange("max_quantity_return_expiry", e.target.value)}
                    placeholder="0"
                    className="flex-1"
                    data-testid="item-form-max-quantity-return-expiry-input"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salt/Molecule & Content */}
          <Card data-testid="salt-molecule-content-section">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Salt/Molecule & Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="salt_molecule" className="w-32 text-sm font-medium">Salt/Molecule</Label>
                  <Input
                    id="salt_molecule"
                    value={formData.salt_molecule}
                    onChange={(e) => handleInputChange("salt_molecule", e.target.value)}
                    placeholder="Enter salt/molecule (comma separated)"
                    className="flex-1"
                    data-testid="item-form-salt-molecule-input"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="content" className="w-32 text-sm font-medium">Content</Label>
                  <Input
                    id="content"
                    value={formData.content}
                    onChange={(e) => handleInputChange("content", e.target.value)}
                    placeholder="Enter content (comma separated)"
                    className="flex-1"
                    data-testid="item-form-content-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="therapeutic" className="w-32 text-sm font-medium">Therapeutic</Label>
                  <Input
                    id="therapeutic"
                    value={formData.therapeutic}
                    onChange={(e) => handleInputChange("therapeutic", e.target.value)}
                    placeholder="Enter therapeutic class"
                    className="flex-1"
                    data-testid="item-form-therapeutic-input"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="sub_therapeutic" className="w-32 text-sm font-medium">Sub Therapeutic</Label>
                  <Input
                    id="sub_therapeutic"
                    value={formData.sub_therapeutic}
                    onChange={(e) => handleInputChange("sub_therapeutic", e.target.value)}
                    placeholder="Enter sub therapeutic class"
                    className="flex-1"
                    data-testid="item-form-sub-therapeutic-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="weight" className="w-32 text-sm font-medium">Weight</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    value={formData.weight}
                    onChange={(e) => handleInputChange("weight", e.target.value)}
                    placeholder="0.00"
                    className="flex-1"
                    data-testid="item-form-weight-input"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="weight_unit" className="w-32 text-sm font-medium">Weight Unit</Label>
                  <Select value={formData.weight_unit} onValueChange={(value) => handleInputChange("weight_unit", value)}>
                    <SelectTrigger className="flex-1" data-testid="item-form-weight-unit-select">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {weightUnits.map((unit) => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings */}
          <Card data-testid="additional-settings-section">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Additional Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="schedule_type" className="w-32 text-sm font-medium">Schedule Type</Label>
                  <Select value={formData.schedule_type} onValueChange={(value) => handleInputChange("schedule_type", value)}>
                    <SelectTrigger className="flex-1" data-testid="item-form-schedule-type-select">
                      <SelectValue placeholder="Select schedule type" />
                    </SelectTrigger>
                    <SelectContent>
                      {scheduleTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="color_type" className="w-32 text-sm font-medium">Color</Label>
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      id="color_type"
                      type="color"
                      value={formData.color_type}
                      onChange={(e) => handleInputChange("color_type", e.target.value)}
                      className="w-12 h-8 rounded border border-input"
                      data-testid="item-form-color-type-input"
                    />
                    <Input
                      value={formData.color_type}
                      onChange={(e) => handleInputChange("color_type", e.target.value)}
                      placeholder="#000000"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="prescription_required" className="w-32 text-sm font-medium">Rx Required</Label>
                  <Switch
                    id="prescription_required"
                    checked={formData.prescription_required}
                    onCheckedChange={(checked) => handleInputChange("prescription_required", checked)}
                    data-testid="item-form-prescription-required-switch"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="is_chronic" className="w-32 text-sm font-medium">Chronic</Label>
                  <Switch
                    id="is_chronic"
                    checked={formData.is_chronic}
                    onCheckedChange={(checked) => handleInputChange("is_chronic", checked)}
                    data-testid="item-form-is-chronic-switch"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="is_tb" className="w-32 text-sm font-medium">TB</Label>
                  <Switch
                    id="is_tb"
                    checked={formData.is_tb}
                    onCheckedChange={(checked) => handleInputChange("is_tb", checked)}
                    data-testid="item-form-is-tb-switch"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="is_active" className="w-32 text-sm font-medium">Active</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                    data-testid="item-form-is-active-switch"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-4">
                  <Label htmlFor="is_returnable" className="w-32 text-sm font-medium">Returnable</Label>
                  <Switch
                    id="is_returnable"
                    checked={formData.is_returnable}
                    onCheckedChange={(checked) => handleInputChange("is_returnable", checked)}
                    data-testid="item-form-is-returnable-switch"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="lock_po_purchase" className="w-32 text-sm font-medium">Lock PO Purchase</Label>
                  <Switch
                    id="lock_po_purchase"
                    checked={formData.lock_po_purchase}
                    onCheckedChange={(checked) => handleInputChange("lock_po_purchase", checked)}
                    data-testid="item-form-lock-po-purchase-switch"
                  />
                </div>
                
                <div className="flex items-center gap-4">
                  <Label htmlFor="skip_from_apo" className="w-32 text-sm font-medium">Skip from APO</Label>
                  <Switch
                    id="skip_from_apo"
                    checked={formData.skip_from_apo}
                    onCheckedChange={(checked) => handleInputChange("skip_from_apo", checked)}
                    data-testid="item-form-skip-from-apo-switch"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Label htmlFor="substitute_for" className="w-32 text-sm font-medium">Substitute For</Label>
                <Input
                  id="substitute_for"
                  value={formData.substitute_for}
                  onChange={(e) => handleInputChange("substitute_for", e.target.value)}
                  placeholder="Enter substitute item"
                  className="flex-1"
                  data-testid="item-form-substitute-for-input"
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t" data-testid="item-form-actions">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={loading}
              data-testid="item-form-cancel-button-bottom"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="min-w-[120px]"
              data-testid="item-form-submit-button"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {mode === "edit" ? "Update Item" : "Save Item"}
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}