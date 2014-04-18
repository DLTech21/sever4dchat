var chatRemote = require('../remote/chatRemote');

module.exports = function(app) {
	return new Handler(app);
};

var Handler = function(app) {
	this.app = app;
};

var handler = Handler.prototype;

/**
 * Send messages to users
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param  {Function} next next stemp callback
 *
 */
handler.send = function(msg, session, next) {
	var msgId = msg.msgId;
	var rid = session.get('rid');
	var username = session.uid.split('*')[0];
	var channelService = this.app.get('channelService');
	var param = {
		route: 'onChat',
		msg: msg.content,
		sender: username,
		target: msg.target,
		post_at: Date.parse(new Date())/1000,
		msg_id: msgId
	};
	channel = channelService.getChannel(rid, false);

	//the target is all users
	if(msg.target == '*') {
		channel.pushMessage(param);
	}
	//the target is specific user
	else {
		next(null, param);
		var tuid = msg.target + '*' + rid;
		var tsid = channel.getMember(tuid)['sid'];
		channelService.pushMessageByUids(param, [{
			uid: tuid,
			sid: tsid
		}]);
	}
	next(null, {
		route: msg.route
	});
};
