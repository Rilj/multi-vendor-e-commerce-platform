export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">MV-Commerce</h3>
            <p className="text-sm text-muted-foreground">
              Enterprise-grade multi-vendor e-commerce platform.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/products" className="text-muted-foreground hover:text-foreground">All Products</a></li>
              <li><a href="/categories" className="text-muted-foreground hover:text-foreground">Categories</a></li>
              <li><a href="/brands" className="text-muted-foreground hover:text-foreground">Brands</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">Help</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/contact" className="text-muted-foreground hover:text-foreground">Contact Us</a></li>
              <li><a href="/shipping" className="text-muted-foreground hover:text-foreground">Shipping</a></li>
              <li><a href="/returns" className="text-muted-foreground hover:text-foreground">Returns</a></li>
              <li><a href="/privacy" className="text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold">For Vendors</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/vendor/register" className="text-muted-foreground hover:text-foreground">Sell on MV-Commerce</a></li>
              <li><a href="/vendor/login" className="text-muted-foreground hover:text-foreground">Vendor Login</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border pt-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} MV-Commerce. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
