const notifyUser = async (userId, message) => {
  // Integration point for Email/Push/SMS services
  console.log(`[Notification] To User ${userId}: ${message}`);
};

module.exports = { notifyUser };