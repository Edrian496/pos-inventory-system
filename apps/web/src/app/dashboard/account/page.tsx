export default function AccountPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>

      <div className="bg-white rounded-xl shadow-sm border p-6 flex gap-6 items-center">
        <img
          src="test"
          alt="avatar"
          className="w-24 h-24 rounded-full border object-cover"
        />
        <div>
          <h2 className="text-xl font-semibold text-gray-800">John Doe</h2>
          <p className="text-gray-500">admin@example.com</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-6">
        <form className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              First Name
            </label>
            <input
              type="text"
              defaultValue="John"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">
              Last Name
            </label>
            <input
              type="text"
              defaultValue="Doe"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              type="email"
              defaultValue="admin@example.com"
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md shadow"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
