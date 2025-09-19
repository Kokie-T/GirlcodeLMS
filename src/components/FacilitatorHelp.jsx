import { memo } from "react";

const FacilitatorHelp = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col gap-6">
      <div className="-full py-3 bg-gradient-to-r from-blue-400 to-pink-400 text-white font-wsemibold rounded-xl shadow text-center text-3xl">
        Facilitator Dashboard Help
      </div>

      <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h3 className="text-2xl font-semibold mb-4">Getting Started</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-3">
          Welcome to the Facilitator Dashboard! This tool helps you manage sessions, 
          communicate with participants, and track progress efficiently.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          Use the navigation sidebar to access various features like managing sessions, messages, 
          and reports.
        </p>
      </section>

      <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h3 className="text-2xl font-semibold mb-4">Managing Sessions</h3>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li><strong>Create a Session:</strong> Click "New Session" and fill out session details including date, time, and participants.</li>
          <li><strong>Edit Session Details:</strong> Access any session from the list, then update information as required.</li>
          <li><strong>Delete Sessions:</strong> Remove sessions that are no longer needed by clicking the delete icon, with confirmation to avoid mistakes.</li>
        </ul>
      </section>
      
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h3 className="text-2xl font-semibold mb-4">Communicating with Participants</h3>
        <p className="text-gray-700 dark:text-gray-300 mb-3">
          Use the Messages section to send direct or group messages to session participants.
        </p>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li><strong>Start a Chat:</strong> Select participants or groups, then send messages in real-time.</li>
          <li><strong>Pin Important Messages:</strong> Pin key messages for easy reference.</li>
          <li><strong>Clear Message History:</strong> Clear conversation messages when necessary for a fresh start.</li>
        </ul>
      </section>
      
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h3 className="text-2xl font-semibold mb-4">Tracking Progress</h3>
        <p className="text-gray-700 dark:text-gray-300">
          View session attendance, participant engagement, and completion reports to monitor progress.
        </p>
      </section>
      
      <section className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
        <h3 className="text-2xl font-semibold mb-4">Tips & Troubleshooting</h3>
        <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
          <li>If messages are not sending, check your internet connection and user authentication status.</li>
          <li>Ensure participants are added to sessions correctly to receive notifications.</li>
          <li>Contact support if you encounter any unexpected errors or feature issues.</li>
        </ul>
      </section>
    </div>
  );
};

export default memo(FacilitatorHelp);
