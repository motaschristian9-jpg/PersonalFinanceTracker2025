export default function Landing() {
  return (
    <div className="bg-white text-gray-900">
      {/* Navbar */}
      <header className="sticky top-0 bg-gray-900 text-white shadow-md z-50">
        <div className="container mx-auto flex items-center justify-between py-4 px-6">
          <a href="/" className="text-2xl font-bold text-emerald-600">
            MoneyTracker
          </a>
          <nav className="space-x-4">
            <a
              href="#get-started"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Get Started
            </a>
            <a
              href="/login"
              className="border border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white px-4 py-2 rounded-lg font-medium"
            >
              Sign In
            </a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto grid md:grid-cols-2 gap-8 items-center py-20 px-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Take Control of Your Money with Ease
          </h1>
          <p className="text-lg mb-6">
            MoneyTracker helps you manage income, expenses, budgets, and
            savings—all in one place.
          </p>
          <div className="space-x-4">
            <a
              href="#get-started"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              Get Started
            </a>
            <a
              href="#features"
              className="border border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white px-6 py-3 rounded-lg font-semibold"
            >
              Learn More
            </a>
          </div>
        </div>
        <div className="hidden md:block">
          <img
            src="/dashboard-preview.png"
            alt="Dashboard Preview"
            className="rounded-xl shadow-lg"
          />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20 px-6">
        <div className="container mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold">Features</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 container mx-auto">
          {[
            "💰 Income & Expense Tracking",
            "📊 Budget Monitoring",
            "🎯 Savings Goals Progress",
            "📈 Visual Reports & Charts",
            "🔔 Smart Alerts & Reminders",
          ].map((feature, i) => (
            <div
              key={i}
              className="text-center border border-gray-200 rounded-xl shadow-sm p-6"
            >
              <p className="text-lg font-semibold">{feature}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="container mx-auto py-20 px-6 text-center">
        <h2 className="text-3xl font-bold mb-12">Why Choose Us</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            "✅ Simple & Easy to Use",
            "🔒 Secure & Private",
            "⚡ Real-Time Tracking",
            "🌍 Access Anytime, Anywhere",
          ].map((point, i) => (
            <div
              key={i}
              className="p-6 bg-gray-50 rounded-xl shadow text-center"
            >
              <p className="font-medium">{point}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Steps Section */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="container mx-auto text-center mb-12">
          <h2 className="text-3xl font-bold">Get Started in Minutes</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8 container mx-auto">
          {[
            {
              step: "✍️ Sign Up",
              desc: "Create your free account.",
            },
            {
              step: "💳 Add Income & Expenses",
              desc: "Track your money in seconds.",
            },
            {
              step: "📊 Stay on Top",
              desc: "View reports and reach your goals.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-6 bg-white border rounded-xl shadow text-center"
            >
              <h3 className="font-bold text-lg mb-2">{item.step}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Persuasion / Join Us Section */}
      <section
        id="get-started"
        className="container mx-auto py-20 px-6 text-center"
      >
        <h2 className="text-3xl font-bold mb-4">
          Ready to take charge of your finances?
        </h2>
        <p className="mb-6 text-lg">
          Join thousands already tracking their money smarter.
        </p>
        <a
          href="/signup"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg text-lg font-semibold"
        >
          Join Now
        </a>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="container mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">MoneyTracker</h3>
            <p className="text-sm">© 2025 MoneyTracker. All rights reserved.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-emerald-400">Home</a></li>
              <li><a href="#features" className="hover:text-emerald-400">Features</a></li>
              <li><a href="/signin" className="hover:text-emerald-400">Sign In</a></li>
              <li><a href="/contact" className="hover:text-emerald-400">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-emerald-400">Facebook</a></li>
              <li><a href="#" className="hover:text-emerald-400">Twitter/X</a></li>
              <li><a href="#" className="hover:text-emerald-400">Instagram</a></li>
              <li><a href="#" className="hover:text-emerald-400">LinkedIn</a></li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
