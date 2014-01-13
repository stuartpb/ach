module.exports = function ach(options) {
  var params = {};
  var paramKeys = ['allowOrigin','allowHeaders','allowCredentials',
    'allowMethods','exposeHeaders','maxAge'];
  var optionKeys = Object.keys(options);
  var i;
  for (i = 0; i < paramKeys.length; i++) {
    params[paramKeys[i]] = options[paramKeys[i]];
  }
  function upperChar(str){
    return str.slice(1).toUpperCase();
  }
  for (i = 0; i < optionKeys.length; i++) {
    var key = optionKeys[i].toLowerCase().replace(/\-\w/g,upperChar);
    params[key] = params[key] === undefined ?
      options[optionKeys[i]] : params[key];
  }

  if (params.allowOrigin === undefined) params.allowOrigin = '*';
  else if (!params.allowOrigin || params.allowOrigin == 'null')
    params.allowOrigin = [];
  else if (params.allowOrigin != '*'
    && !Array.isArray(params.allowOrigin)) {
    params.allowOrigin = params.allowOrigin.split(' ');
  }

  if (params.allowHeaders === undefined)
    params.allowHeaders = "X-Requested-With";

  return function achMiddleware(req, res, next) {
    var reqOrigin = req.header('Origin');
    if (params.allowOrigin && reqOrigin) {
      var matchOrigin = ~params.allowOrigin.indexOf(reqOrigin)
        || params.allowOrigin == '*' && params.allowCredentials;
      if (params.allowOrigin == '*' || matchOrigin) {
        if (matchOrigin) {
          res.header("Access-Control-Allow-Origin", reqOrigin);
          // If there are other potential results for this header
          if (params.allowOrigin.length > 1
          // and nobody's already set the "Origin" header in Vary
          && (!res.get("Vary")
            || res.get("Vary").split(/\s*,\s*/g).indexOf('Origin') == -1)) {

            // specify that the Origin header can vary the request
            // (on top of any other headers specified)
            res.header("Vary", (res.get("Vary") ?
              res.get("Vary") + ', ' : '') + "Origin");
          }
        } else {
          res.header("Access-Control-Allow-Origin", "*");
        }

        if (params.allowCredentials) {
          res.header("Access-Control-Allow-Credentials", 'true');
        }
        if (params.exposeHeaders) {
          res.header("Access-Control-Expose-Headers", params.exposeHeaders);
        }
        if (params.maxAge) {
          // The spec says not to set this if the Origin doesn't match,
          // even though that seems like it would trigger a lot of unnecessary
          // preflight requests for bad origins to me.
          // I've emailed annevk for clarification.
          res.header("Access-Control-Max-Age", params.maxAge);
        }
        if (params.allowMethods) {
          res.header("Access-Control-Allow-Methods", params.allowMethods);
        }
        if (params.allowHeaders) {
          res.header("Access-Control-Allow-Headers", params.allowHeaders);
        }
      }
    }
    next();
  };
};
