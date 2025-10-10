import React, { useState, useEffect } from 'react';
import { Product } from '../../types/mesero';
import { getProducts } from '../../services/mesero/productService';
import Button from '../common/Button';
import { Search } from 'lucide-react';
import '../../styles/mesero/ProductCatalog.css';

interface ProductCatalogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product, quantity: number) => void;
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ isOpen, onClose, onSelectProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await getProducts();

      setProducts(data);

    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setQuantity(1);
  };

  const handleAddToOrder = async () => {
    if (selectedProduct) {
      setIsAdding(true); 
      try {
        await onSelectProduct(selectedProduct, quantity);
      } catch (error) {
        console.error('Error agregando producto:', error);
      } finally {
        setIsAdding(false); 
        setSelectedProduct(null);
        setQuantity(1);
        onClose(); 
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="catalog-backdrop" onClick={handleBackdropClick}>
      <div className="catalog-container" onClick={(e) => e.stopPropagation()}>
        <div className="catalog-content">
          
          {/* Header */}
          <div className="catalog-header">
            <h2 className="catalog-title">Catálogo de Productos</h2>
            <button className="catalog-close-btn" onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className="catalog-search">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Products Grid - SIN CATEGORÍAS */}
          <div className="catalog-products">
            {isLoading ? (
              <div className="loading-products">
                <div className="spinner-small"></div>
                <p>Cargando productos...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="no-products">
                <p>No se encontraron productos</p>
              </div>
            ) : (
              filteredProducts.map(product => (
                <div
                  key={product.id}
                  className={`product-card ${selectedProduct?.id === product.id ? 'selected' : ''} ${product.stock === 0 ? 'out-of-stock' : ''}`}
                  onClick={() => product.stock > 0 && handleProductClick(product)}
                >
                  <div className={`product-badge ${product.stock === 0 ? 'out-of-stock' : ''}`}>
                    {product.stock > 0 ? 'Disponible' : 'Agotado'}
                  </div>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-price">${product.price.toLocaleString()}</p>
                  <div className="product-meta">
                    {product.type === 'prepared' && (
                      <span className="product-type">Preparable</span>
                    )}
                    {product.stock <= 5 && product.stock > 0 && (
                      <span className="product-low-stock"> {product.stock} unidades</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer - Quantity Selector */}
        {selectedProduct && (
          <div className="catalog-footer">
            <div className="selected-product-info">
              <h4>{selectedProduct.name}</h4>
              <p>${selectedProduct.price.toLocaleString()} c/u</p>
            </div>
            
            <div className="quantity-selector">
              <button 
                className="qty-btn"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <span className="qty-value">{quantity}</span>
              <button 
                className="qty-btn"
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= (selectedProduct.stock || 0)}
              >
                +
              </button>
            </div>

            <div className="footer-actions">
              <Button variant="secondary" onClick={() => setSelectedProduct(null)}>
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                onClick={handleAddToOrder}
                disabled={selectedProduct.stock <= 0 || isAdding}
              >
                {isAdding
                  ? 'Agregando...'
                  : `Agregar ($${(selectedProduct.price * quantity).toLocaleString()})`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCatalog;