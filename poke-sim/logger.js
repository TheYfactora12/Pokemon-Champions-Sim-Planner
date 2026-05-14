// Structured logger mounted on window.ChampionsSim.logger.
(function(root) {
  var LEVELS = { debug: 10, info: 20, warn: 30, error: 40, silent: 99 };
  var state = { level: 'warn', records: [] };
  function normalize(fields) {
    if (!fields) return {};
    if (fields instanceof Error) return { error: { name: fields.name, message: fields.message, stack: fields.stack } };
    if (typeof fields === 'object') return fields;
    return { value: fields };
  }
  function emit(level, namespace, message, fields) {
    var rec = {
      ts: new Date().toISOString(),
      level: level,
      namespace: namespace || 'app',
      message: String(message || ''),
      fields: normalize(fields)
    };
    state.records.push(rec);
    if (state.records.length > 200) state.records.shift();
    if (LEVELS[level] < LEVELS[state.level]) return rec;
    var c = root.console;
    if (c && typeof c[level] === 'function') c[level]('[' + rec.namespace + '] ' + rec.message, rec.fields);
    return rec;
  }
  var logger = {
    setLevel: function(level) { if (LEVELS[level] != null) state.level = level; },
    getLevel: function() { return state.level; },
    records: function() { return state.records.slice(); },
    debug: function(ns, msg, fields) { return emit('debug', ns, msg, fields); },
    info: function(ns, msg, fields) { return emit('info', ns, msg, fields); },
    warn: function(ns, msg, fields) { return emit('warn', ns, msg, fields); },
    error: function(ns, msg, fields) { return emit('error', ns, msg, fields); },
    for: function(ns) {
      return {
        debug: function(msg, fields) { return emit('debug', ns, msg, fields); },
        info: function(msg, fields) { return emit('info', ns, msg, fields); },
        warn: function(msg, fields) { return emit('warn', ns, msg, fields); },
        error: function(msg, fields) { return emit('error', ns, msg, fields); }
      };
    }
  };
  root.ChampionsSim = root.ChampionsSim || {};
  root.ChampionsSim.logger = root.ChampionsSim.logger || logger;
})(typeof window !== 'undefined' ? window : globalThis);
