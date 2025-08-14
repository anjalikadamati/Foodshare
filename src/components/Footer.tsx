import { Leaf, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="p-2 bg-white/10 rounded-lg">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold">FoodShare</h1>
            </div>
            <p className="text-primary-foreground/80 mb-6 max-w-md">
              Connecting communities to reduce food waste and fight hunger. 
              Together, we can make every meal count.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span className="text-sm">kadamatihemanjali25@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+91 9392888083</span>
              </div>
            </div>
          </div>
          
         {/* links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {["How it Works", "About Us", "Contact", "FAQ", "Support"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-primary-foreground/80 hover:text-white transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {["Privacy Policy", "Terms of Service", "Food Safety", "Community Guidelines"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-primary-foreground/80 hover:text-white transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-primary-foreground/60 text-sm">
            © 2025 FoodShare. All rights reserved. Made with ❤️ for the community.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;