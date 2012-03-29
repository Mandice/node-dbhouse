module.exports = function(conditions) {
	return parse(conditions);
};

function getPropertyName(obj) {
	for (var name in obj) {
		return name;
	}
}

function parse(conditions) {
	var execution = {};

	/* MongoDB doesn't support '$or' before 1.6 version, we need to use '$where' instead of. */
	if ('$or' in conditions) {
		if (conditions['$or'] instanceof Array) {
			execution['$where'] = '';

			for (var index in conditions['$or']) {
				var part = conditions['$or'][index];

				/* Make sure it is object */
				if (!(part instanceof Object))
					break;

				var exec = parse(part);
				var name = getPropertyName(exec);

				if (execution['$where'] != '')
					execution['$where'] += '||'

				execution['$where'] += '(this.' + name + ' == \'' + exec[name] + '\')';
			}
		}
	} else {
		execution = conditions;
	}

	return execution;
}
