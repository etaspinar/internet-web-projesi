import React from 'react';

const CategoryForm = ({ newCategory, setNewCategory, handleCategorySubmit, loadingData }) => {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-header bg-white py-3">
        <h5 className="mb-0">Yeni Kategori Ekle</h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleCategorySubmit}>
          <div className="mb-3">
            <label htmlFor="categoryName" className="form-label">Kategori Adı <span className="text-danger">*</span></label>
            <input 
              type="text" 
              className="form-control" 
              id="categoryName" 
              name="name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="categoryDescription" className="form-label">Açıklama</label>
            <textarea 
              className="form-control" 
              id="categoryDescription" 
              name="description"
              value={newCategory.description}
              onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
              rows="3"
            ></textarea>
          </div>
          <button type="submit" className="btn btn-success w-100" disabled={loadingData}>
            {loadingData ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Kaydediliyor...
              </>
            ) : (
              <>
                <i className="fa-solid fa-save me-2"></i>
                Kategori Ekle
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm;
