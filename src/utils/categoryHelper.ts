// Utility function untuk menangani category yang bisa berupa string atau object
export const getCategoryName = (category: any): string => {
  if (!category) return '';
  
  // Jika category adalah object dengan property name
  if (typeof category === 'object' && category.name) {
    return category.name;
  }
  
  // Jika category adalah string
  if (typeof category === 'string') {
    return category;
  }
  
  // Fallback
  return '';
};

export const getCategoryId = (category: any): string => {
  if (!category) return '';
  
  // Jika category adalah object dengan property _id
  if (typeof category === 'object' && category._id) {
    return category._id;
  }
  
  // Jika category adalah string (legacy)
  if (typeof category === 'string') {
    return category;
  }
  
  // Fallback
  return '';
};
