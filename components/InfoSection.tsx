

export default function InfoSection() {
  return (
    <section>
      <div className="mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-center md:gap-10">
          
          {/* Text */}
          <div>
            <div className="max-w-lg md:max-w-none">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white sm:text-3xl">
                Powering Africa’s EV Future
              </h2>

              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Ecoswaech connects EV owners, charging infrastructure, and trusted
                marketplaces into one unified platform. Discover chargers, manage
                your vehicles, and transact with confidence using SWAECH ID.
              </p>
            </div>
          </div>

          {/* Image */}
          <div>
            <img
              src="https://pbs.twimg.com/media/Gda-K8AW8AA0At1?format=jpg&name=4096x4096"
              className="rounded-xl shadow-md"
              alt="EV charging"
            />
          </div>

        </div>
      </div>
    </section>
  );
}