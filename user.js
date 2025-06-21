exports.handler = async (event, context) => {
  if (!storedUser) {
    return {
      statusCode: 404,
      body: "No user logged in"
    };
  }
  return {
    statusCode: 200,
    body: JSON.stringify(storedUser)
  };
};
