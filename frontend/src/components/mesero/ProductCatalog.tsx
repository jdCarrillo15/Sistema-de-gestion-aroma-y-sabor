import React, { useState, useEffect } from 'react';
import { Product } from '../../types/mesero';
import { getProducts } from '../../services/mesero/productService';
import Button from '../common/Button';
import { Search } from 'lucide-react';
import styles from '../../styles/mesero/ProductCatalog.module.css';

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
      setIsAdding(true);
      try {
        await onSelectProduct(selectedProduct, quantity);
      } catch (error) {
        console.error('Error agregando producto:', error);
      } finally {
        setIsAdding(false);
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
    <div className={styles.catalogBackdrop} onClick={handleBackdropClick}>
      <div className={styles.catalogContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.catalogContent}>

          {/* Header */}
          <div className={styles.catalogHeader}>
            <h2 className={styles.catalogTitle}>Catálogo de Productos</h2>
            <button className={styles.catalogCloseBtn} onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Search */}
          <div className={styles.catalogSearch}>
            <Search className={styles.searchIcon} size={20} />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Products Grid */}
          <div className={styles.catalogProducts}>
            {isLoading ? (
              <div className={styles.loadingProducts}>
                <div className={styles.spinnerSmall}></div>
                <p>Cargando productos...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className={styles.noProducts}>
                <p>No se encontraron productos</p>
              </div>
            ) : (
              filteredProducts.map(product => (
                <div
                  key={product.id}
                  className={`${styles.productCard} ${selectedProduct?.id === product.id ? styles.selected : ''} ${product.stock === 0 ? styles.outOfStock : ''}`}
                  onClick={() => product.stock > 0 && handleProductClick(product)}
                >
                  <div className={`${styles.productBadge} ${product.stock === 0 ? styles.badgeOutOfStock : ''}`}>
                    {product.stock > 0 ? 'Disponible' : 'Agotado'}
                  </div>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productPrice}>${product.price.toLocaleString()}</p>
                  <div className={styles.productMeta}>
                    {product.type === 'prepared' && (
                      <span className={styles.productType}>Preparable</span>
                    )}
                    {product.stock <= 5 && product.stock > 0 && (
                      <span className={styles.productLowStock}>{product.stock} unidades</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer - Quantity Selector */}
        {selectedProduct && (
          <div className={styles.catalogFooter}>
            <div className={styles.selectedProductInfo}>
              <h4>{selectedProduct.name}</h4>
              <p>${selectedProduct.price.toLocaleString()} c/u</p>
            </div>

            <div className={styles.quantitySelector}>
              <button
                className={styles.qtyBtn}
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                -
              </button>
              <span className={styles.qtyValue}>{quantity}</span>
              <button
                className={styles.qtyBtn}
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= (selectedProduct.stock || 0)}
              >
                +
              </button>
            </div>

            <div className={styles.footerActions}>
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