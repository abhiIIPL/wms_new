// Mock data for development - will be replaced with real API calls
const mockItems = [
  {
    id: "1",
    // Product Info Fields
    product_code: "P001",
    identifier: "12345",
    name: "Paracetamol 500mg Tablets",
    description: "Pain relief and fever reducer tablets, 500mg strength, blister pack of 20 tablets",
    category: "Analgesics",
    warehouse: "Main Warehouse",
    manufacturer_group: "Pharma Group A",
    manufacturer: "MediCorp Pharmaceuticals",
    marketed_by: "MediCorp Sales",
    brand: "ParaMax",
    pack_size: "20 tablets",
    unit_per_pack: 20,
    loose_sale: false,
    outer_quantity_pack: 10,
    unit_measurement: "Tablets",
    form: "Blister Pack",
    schedule_type: "Schedule H",
    primary_rack: "A1-01",
    secondary_rack: "B2-05",
    therapeutic: "Analgesic",
    sub_therapeutic: "Non-narcotic analgesic",
    is_chronic: false,
    is_tb: false,
    prescription_required: true,
    storage_type: "Room Temperature",
    is_active: true,
    color_type: "#3b82f6",
    salt_molecule: ["Paracetamol"],
    content: ["Paracetamol 500mg"],
    substitute_for: null,
    weight: 0.5,
    weight_unit: "grams",
    max_quantity_return_expiry: 100,
    is_dpco: false,
    
    // Pricing Info Fields
    hsn_sac: "30049099",
    tax_category: "GST Sale - 12%",
    min_margin_sale: 15.5,
    min_margin_purchase: 8.0,
    sale_rate: 12.5,
    scheme_type: "Standard",
    allow_discount: true,
    max_discount: 10.0,
    discount: 5.0,
    box_discount: 2.0,
    box_mrp: 250.0,
    box_ptr: 200.0,
    force_sp: null,
    min_stock: 50,
    max_stock: 1000,
    sales_days: 30,
    expiry_days: 730,
    
    // Other Fields
    lock_po_purchase: false,
    is_returnable: true,
    skip_from_apo: false,
    
    // Legacy fields for compatibility
    price: 12.5,
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
  },
  {
    id: "2",
    // Product Info Fields
    product_code: "P002",
    identifier: "23456",
    name: "Amoxicillin 250mg Capsules",
    description: "Broad-spectrum antibiotic capsules, 250mg strength, bottle of 100 capsules",
    category: "Antibiotics",
    warehouse: "Main Warehouse",
    manufacturer_group: "Pharma Group B",
    manufacturer: "PharmaTech Solutions",
    marketed_by: "PharmaTech Sales",
    brand: "AmoxiMax",
    pack_size: "100 capsules",
    unit_per_pack: 100,
    loose_sale: true,
    outer_quantity_pack: 5,
    unit_measurement: "Capsules",
    form: "Bottle",
    schedule_type: "Schedule H",
    primary_rack: "A2-03",
    secondary_rack: "B1-02",
    therapeutic: "Antibiotic",
    sub_therapeutic: "Beta-lactam antibiotic",
    is_chronic: false,
    is_tb: false,
    prescription_required: true,
    storage_type: "Room Temperature",
    is_active: true,
    color_type: "#ef4444",
    salt_molecule: ["Amoxicillin"],
    content: ["Amoxicillin 250mg"],
    substitute_for: null,
    weight: 0.3,
    weight_unit: "grams",
    max_quantity_return_expiry: 50,
    is_dpco: true,
    
    // Pricing Info Fields
    hsn_sac: "30049010",
    tax_category: "GST Sale - 12%",
    min_margin_sale: 20.0,
    min_margin_purchase: 12.0,
    sale_rate: 45.75,
    scheme_type: "Dynamic",
    allow_discount: false,
    max_discount: 0.0,
    discount: 0.0,
    box_discount: 0.0,
    box_mrp: 228.75,
    box_ptr: 183.0,
    force_sp: 45.75,
    min_stock: 25,
    max_stock: 500,
    sales_days: 45,
    expiry_days: 1095,
    
    // Other Fields
    lock_po_purchase: false,
    is_returnable: true,
    skip_from_apo: false,
    
    // Legacy fields for compatibility
    price: 45.75,
    created_at: "2024-01-16T14:20:00Z",
    updated_at: "2024-01-16T14:20:00Z",
  },
  // Add more comprehensive mock items...
]

// Generate more mock data for testing pagination
const generateMockData = (count = 1000) => {
  const categories = [
    "Analgesics", "Antibiotics", "Diabetes Care", "Gastroenterology", "Respiratory",
    "Antihistamines", "Cardiovascular", "Dermatology", "Neurology", "Oncology",
  ]
  
  const drugNames = [
    "Paracetamol", "Amoxicillin", "Insulin", "Omeprazole", "Salbutamol",
    "Metformin", "Cetirizine", "Atorvastatin", "Ibuprofen", "Aspirin",
  ]
  
  const strengths = ["5mg", "10mg", "20mg", "25mg", "50mg", "100mg", "250mg", "500mg"]
  const forms = ["Tablets", "Capsules", "Injection", "Syrup", "Cream", "Inhaler"]
  const manufacturers = ["MediCorp", "PharmaTech", "HealthCorp", "MedLife", "CurePharma"]
  const brands = ["MaxHealth", "CureAll", "MediMax", "HealthPlus", "VitalCare"]
  const storageTypes = ["Room Temperature", "Refrigerated", "Frozen", "Controlled"]
  const scheduleTypes = ["Schedule H", "Schedule H1", "No Narcotics", "OTC"]

  const items = [...mockItems] // Start with original items

  for (let i = 3; i <= count; i++) {
    const drugName = drugNames[Math.floor(Math.random() * drugNames.length)]
    const strength = strengths[Math.floor(Math.random() * strengths.length)]
    const form = forms[Math.floor(Math.random() * forms.length)]
    const category = categories[Math.floor(Math.random() * categories.length)]
    const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)]
    const brand = brands[Math.floor(Math.random() * brands.length)]
    const storageType = storageTypes[Math.floor(Math.random() * storageTypes.length)]
    const scheduleType = scheduleTypes[Math.floor(Math.random() * scheduleTypes.length)]

    items.push({
      id: String(i),
      // Product Info Fields
      product_code: `P${String(i).padStart(3, '0')}`,
      identifier: String(10000 + i),
      name: `${drugName} ${strength} ${form}`,
      description: `${drugName} medication in ${form.toLowerCase()} form, ${strength} strength, pharmaceutical grade`,
      category: category,
      warehouse: "Main Warehouse",
      manufacturer_group: `${manufacturer} Group`,
      manufacturer: `${manufacturer} Pharmaceuticals`,
      marketed_by: `${manufacturer} Sales`,
      brand: brand,
      pack_size: `${Math.floor(Math.random() * 100 + 10)} ${form.toLowerCase()}`,
      unit_per_pack: Math.floor(Math.random() * 100 + 10),
      loose_sale: Math.random() > 0.7,
      outer_quantity_pack: Math.floor(Math.random() * 20 + 5),
      unit_measurement: form,
      form: form === "Tablets" ? "Blister Pack" : "Bottle",
      schedule_type: scheduleType,
      primary_rack: `${String.fromCharCode(65 + Math.floor(Math.random() * 5))}${Math.floor(Math.random() * 5 + 1)}-${String(Math.floor(Math.random() * 20 + 1)).padStart(2, '0')}`,
      secondary_rack: `${String.fromCharCode(65 + Math.floor(Math.random() * 5))}${Math.floor(Math.random() * 5 + 1)}-${String(Math.floor(Math.random() * 20 + 1)).padStart(2, '0')}`,
      therapeutic: category,
      sub_therapeutic: `${category} subclass`,
      is_chronic: Math.random() > 0.8,
      is_tb: Math.random() > 0.95,
      prescription_required: Math.random() > 0.3,
      storage_type: storageType,
      is_active: Math.random() > 0.1,
      color_type: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      salt_molecule: [drugName],
      content: [`${drugName} ${strength}`],
      substitute_for: null,
      weight: Math.round((Math.random() * 5 + 0.1) * 100) / 100,
      weight_unit: "grams",
      max_quantity_return_expiry: Math.floor(Math.random() * 200 + 50),
      is_dpco: Math.random() > 0.7,
      
      // Pricing Info Fields
      hsn_sac: `3004${String(Math.floor(Math.random() * 9000 + 1000))}`,
      tax_category: `GST Sale - ${[5, 12, 18, 28][Math.floor(Math.random() * 4)]}%`,
      min_margin_sale: Math.round((Math.random() * 20 + 5) * 100) / 100,
      min_margin_purchase: Math.round((Math.random() * 15 + 3) * 100) / 100,
      sale_rate: Math.round((Math.random() * 200 + 5) * 100) / 100,
      scheme_type: ["Standard", "Dynamic", "Half Scheme"][Math.floor(Math.random() * 3)],
      allow_discount: Math.random() > 0.3,
      max_discount: Math.round((Math.random() * 15) * 100) / 100,
      discount: Math.round((Math.random() * 10) * 100) / 100,
      box_discount: Math.round((Math.random() * 5) * 100) / 100,
      box_mrp: Math.round((Math.random() * 1000 + 100) * 100) / 100,
      box_ptr: Math.round((Math.random() * 800 + 80) * 100) / 100,
      force_sp: Math.random() > 0.8 ? Math.round((Math.random() * 200 + 5) * 100) / 100 : null,
      min_stock: Math.floor(Math.random() * 100 + 10),
      max_stock: Math.floor(Math.random() * 1000 + 100),
      sales_days: Math.floor(Math.random() * 60 + 15),
      expiry_days: Math.floor(Math.random() * 1000 + 365),
      
      // Other Fields
      lock_po_purchase: Math.random() > 0.9,
      is_returnable: Math.random() > 0.2,
      skip_from_apo: Math.random() > 0.8,
      
      // Legacy fields for compatibility
      price: Math.round((Math.random() * 200 + 5) * 100) / 100,
      created_at: new Date(2024, 0, Math.floor(Math.random() * 365)).toISOString(),
      updated_at: new Date(2024, 0, Math.floor(Math.random() * 365)).toISOString(),
    })
  }

  return items
}

// Generate large dataset for testing
const allMockItems = generateMockData(2500) // Generate 2500 items for testing

// Simulate API delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// API Service Class
export class ApiService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_NEXT_PUBLIC_API_URL || "/api"
    this.useMockData = true // Toggle this when backend is ready
  }

  // Items API with pagination
  async getItems(options = {}) {
    const { page = 1, limit = 50, search = "", category = "all", sortBy = "name", sortOrder = "asc" } = options

    if (this.useMockData) {
      await delay(300) // Simulate network delay

      // Filter items
      const filteredItems = allMockItems.filter((item) => {
        const matchesSearch =
          search === "" ||
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase()) ||
          item.product_code.toLowerCase().includes(search.toLowerCase()) ||
          item.identifier.toLowerCase().includes(search.toLowerCase()) ||
          item.brand.toLowerCase().includes(search.toLowerCase()) ||
          item.manufacturer.toLowerCase().includes(search.toLowerCase())
        const matchesCategory = category === "all" || item.category === category
        return matchesSearch && matchesCategory
      })

      // Sort items
      filteredItems.sort((a, b) => {
        let aValue = a[sortBy]
        let bValue = b[sortBy]

        if (typeof aValue === "string") {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        if (sortOrder === "asc") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
        }
      })

      // Paginate
      const totalItems = filteredItems.length
      const totalPages = Math.ceil(totalItems / limit)
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedItems = filteredItems.slice(startIndex, endIndex)

      return {
        success: true,
        data: paginatedItems,
        pagination: {
          currentPage: page,
          totalPages: totalPages,
          totalItems: totalItems,
          itemsPerPage: limit,
          startItem: startIndex + 1,
          endItem: Math.min(endIndex, totalItems),
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
      }
    }

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        category,
        sortBy,
        sortOrder,
      })

      const response = await fetch(`${this.baseUrl}/items?${queryParams}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching items:", error)
      return { success: false, error: error.message }
    }
  }

  async getItem(id) {
    if (this.useMockData) {
      await delay(300)
      const item = allMockItems.find((item) => item.id === id)
      return {
        success: !!item,
        data: item,
        error: !item ? "Item not found" : null,
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/items/${id}`)
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error fetching item:", error)
      return { success: false, error: error.message }
    }
  }

  async createItem(itemData) {
    if (this.useMockData) {
      await delay(800)
      const newItem = {
        id: String(allMockItems.length + 1),
        product_code: `P${String(allMockItems.length + 1).padStart(3, '0')}`,
        ...itemData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      allMockItems.push(newItem)
      return {
        success: true,
        data: newItem,
        message: "Item created successfully",
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error creating item:", error)
      return { success: false, error: error.message }
    }
  }

  async updateItem(id, itemData) {
    if (this.useMockData) {
      await delay(600)
      const index = allMockItems.findIndex((item) => item.id === id)
      if (index !== -1) {
        allMockItems[index] = {
          ...allMockItems[index],
          ...itemData,
          updated_at: new Date().toISOString(),
        }
        return {
          success: true,
          data: allMockItems[index],
          message: "Item updated successfully",
        }
      }
      return { success: false, error: "Item not found" }
    }

    try {
      const response = await fetch(`${this.baseUrl}/items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(itemData),
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error updating item:", error)
      return { success: false, error: error.message }
    }
  }

  async deleteItem(id) {
    if (this.useMockData) {
      await delay(400)
      const index = allMockItems.findIndex((item) => item.id === id)
      if (index !== -1) {
        const deletedItem = allMockItems.splice(index, 1)[0]
        return {
          success: true,
          data: deletedItem,
          message: "Item deleted successfully",
        }
      }
      return { success: false, error: "Item not found" }
    }

    try {
      const response = await fetch(`${this.baseUrl}/items/${id}`, {
        method: "DELETE",
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error("Error deleting item:", error)
      return { success: false, error: error.message }
    }
  }

  // Toggle between mock and real API
  setMockMode(useMock) {
    this.useMockData = useMock
  }

  // Get current mode
  isMockMode() {
    return this.useMockData
  }
}

// Export singleton instance
export const apiService = new ApiService()