import { ArrowRight, ChevronRight, Play } from "lucide-react";

const Hero = () => {
  return (
    <section
      id="home"
      className="relative pt-32 pb-20 overflow-hidden min-h-screen flex items-center"
    >
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary opacity-5 dark:opacity-5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-primary opacity-10 dark:opacity-10 blur-[120px] rounded-full"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-primary text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span>2025 Admissions are now open</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight">
              Elevate Your <span className="text-primary">Potential</span>,
              Connect Your Future.
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-xl">
              SchoolDesk is a premier technology-driven university designed for
              the next generation of innovators, engineers, and digital artists.
            </p>

            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-primary text-primary-foreground px-8 py-4 rounded-lg font-bold hover:bg-primary/90 transition-all transform hover:translate-y-[-2px] shadow-lg shadow-[rgba(30,157,241,0.3)]">
                <span>Start Application</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-transparent text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 hover:border-primary px-8 py-4 rounded-lg font-bold transition-all">
                <Play className="w-4 h-4 text-primary fill-primary" />
                <span>Watch Virtual Tour</span>
              </button>
            </div>

            <div className="flex items-center space-x-6 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  12k+
                </p>
                <p className="text-sm text-gray-500">Active Students</p>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-800"></div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  98%
                </p>
                <p className="text-sm text-gray-500">Graduate Hire Rate</p>
              </div>
              <div className="w-px h-8 bg-gray-200 dark:bg-gray-800"></div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  #1
                </p>
                <p className="text-sm text-gray-500">Tech Innovation</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1200"
                alt="SchoolDesk Modern Campus"
                className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 dark:from-[#121212] via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6 p-6 bg-white/90 dark:bg-[#1c1c1c]/90 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-primary mb-1 uppercase tracking-wider">
                  Upcoming Event
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  Quantum Computing Workshop
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Join us on April 15th for an exclusive look into the future.
                </p>
              </div>
            </div>

            {/* Floating Element */}
            <div className="absolute -top-6 -right-6 bg-white dark:bg-[#1c1c1c] p-4 rounded-xl border border-gray-200 dark:border-gray-800 shadow-xl hidden md:block animate-bounce-slow">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <ChevronRight className="text-current" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">New Research</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    Carbon Neutral Campus
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
