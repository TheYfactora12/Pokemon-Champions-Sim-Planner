// ============================================================
// BATTLE SENSEI
// Local-only parser and coaching summary helpers.
// ============================================================

(function(root) {
  var ChampionsSim = root.ChampionsSim = root.ChampionsSim || {};
  ChampionsSim.replayCoach = ChampionsSim.replayCoach || {};

  function cleanText(value) {
    return String(value == null ? '' : value).trim();
  }

  function normalizeSide(side) {
    var s = cleanText(side).toLowerCase();
    if (s === 'p2' || s === 'player2' || s === 'opponent') return 'p2';
    return 'p1';
  }

  function sideOf(slot) {
    var m = cleanText(slot).match(/^(p[12])/i);
    return m ? m[1].toLowerCase() : '';
  }

  function nameFromSlot(slot) {
    var raw = cleanText(slot);
    var idx = raw.indexOf(':');
    return cleanText(idx >= 0 ? raw.slice(idx + 1) : raw);
  }

  function speciesFromDetails(details) {
    return cleanText(details).split(',')[0].trim();
  }

  function hpPercent(hpText) {
    var raw = cleanText(hpText);
    if (!raw || raw === '0 fnt') return 0;
    var m = raw.match(/(\d+)\/(\d+)/);
    if (m) {
      var cur = parseInt(m[1], 10);
      var max = parseInt(m[2], 10);
      return max > 0 ? Math.max(0, Math.min(100, Math.round((cur / max) * 100))) : null;
    }
    m = raw.match(/^(\d+)%/);
    if (m) return Math.max(0, Math.min(100, parseInt(m[1], 10)));
    return null;
  }

  function ensureTurn(model, number) {
    var n = Math.max(0, parseInt(number, 10) || 0);
    if (!model.turns.length || model.turns[model.turns.length - 1].number !== n) {
      model.turns.push({
        number: n,
        events: [],
        moves: [],
        switches: [],
        faints: [],
        damage: [],
        healing: [],
        field: [],
        status: [],
        rng: []
      });
    }
    return model.turns[model.turns.length - 1];
  }

  function addUnique(list, value) {
    var v = cleanText(value);
    if (v && list.indexOf(v) < 0) list.push(v);
  }

  function parseShowdownLog(rawLog, opts) {
    opts = opts || {};
    var selectedSide = normalizeSide(opts.selectedSide || 'p1');
    var text = cleanText(rawLog);
    var model = {
      ok: false,
      selectedSide: selectedSide,
      format: '',
      rated: null,
      players: { p1: '', p2: '' },
      teamPreview: { p1: [], p2: [] },
      selectedPokemon: { p1: [], p2: [] },
      leads: { p1: [], p2: [] },
      winner: '',
      result: 'unknown',
      forfeit: false,
      totalTurns: 0,
      turns: [],
      warnings: [],
      rawLineCount: text ? text.split(/\r?\n/).length : 0
    };

    if (!text) {
      model.warnings.push('No replay log was provided.');
      return model;
    }

    var currentTurn = ensureTurn(model, 0);
    var seenFirstTurn = false;
    var activeSeenBeforeTurnOne = { p1: [], p2: [] };
    var lines = text.split(/\r?\n/);

    lines.forEach(function(line) {
      var raw = cleanText(line);
      if (!raw || raw.charAt(0) !== '|') return;
      var parts = raw.split('|');
      var tag = parts[1] || '';

      if (tag === 'player') {
        var side = normalizeSide(parts[2]);
        model.players[side] = cleanText(parts[3]);
        return;
      }
      if (tag === 'tier' || tag === 'gametype') {
        model.format = model.format || cleanText(parts[2]);
        return;
      }
      if (tag === 'rated') {
        model.rated = true;
        return;
      }
      if (tag === 'poke') {
        var previewSide = normalizeSide(parts[2]);
        addUnique(model.teamPreview[previewSide], speciesFromDetails(parts[3] || ''));
        return;
      }
      if (tag === 'turn') {
        seenFirstTurn = true;
        currentTurn = ensureTurn(model, parts[2]);
        model.totalTurns = Math.max(model.totalTurns, currentTurn.number);
        return;
      }
      if (tag === 'win') {
        model.winner = cleanText(parts[2]);
        return;
      }
      if (tag === 'tie') {
        model.result = 'tie';
        return;
      }
      if (tag === '-message' && /forfeit/i.test(raw)) {
        model.forfeit = true;
      }

      if (tag === 'switch' || tag === 'drag' || tag === 'replace') {
        var slot = parts[2];
        var side = sideOf(slot);
        var mon = nameFromSlot(slot) || speciesFromDetails(parts[3] || '');
        var details = speciesFromDetails(parts[3] || mon);
        var hp = hpPercent(parts[4] || '');
        if (side) {
          addUnique(model.selectedPokemon[side], mon || details);
          if (!seenFirstTurn) addUnique(activeSeenBeforeTurnOne[side], mon || details);
        }
        currentTurn.switches.push({ side: side, pokemon: mon || details, details: details, hp: hp, forced: tag === 'drag' });
        currentTurn.events.push({ type: tag, side: side, pokemon: mon || details, text: raw });
        return;
      }

      if (tag === 'move') {
        var actorSlot = parts[2];
        var actorSide = sideOf(actorSlot);
        var actor = nameFromSlot(actorSlot);
        var move = cleanText(parts[3]);
        var targetSlot = parts[4] || '';
        var targetSide = sideOf(targetSlot);
        var target = nameFromSlot(targetSlot);
        if (actorSide) addUnique(model.selectedPokemon[actorSide], actor);
        currentTurn.moves.push({ side: actorSide, pokemon: actor, move: move, targetSide: targetSide, target: target });
        currentTurn.events.push({ type: 'move', side: actorSide, pokemon: actor, move: move, target: target, text: raw });
        return;
      }

      if (tag === 'faint') {
        var faintSlot = parts[2];
        var faintSide = sideOf(faintSlot);
        var faintMon = nameFromSlot(faintSlot);
        if (faintSide) addUnique(model.selectedPokemon[faintSide], faintMon);
        currentTurn.faints.push({ side: faintSide, pokemon: faintMon });
        currentTurn.events.push({ type: 'faint', side: faintSide, pokemon: faintMon, text: raw });
        return;
      }

      if (tag === '-damage' || tag === '-heal') {
        var hpSlot = parts[2];
        var hpSide = sideOf(hpSlot);
        var hpMon = nameFromSlot(hpSlot);
        var hpValue = hpPercent(parts[3] || '');
        var row = { side: hpSide, pokemon: hpMon, hp: hpValue, cause: cleanText(parts.slice(4).join('|')) };
        if (tag === '-damage') currentTurn.damage.push(row);
        else currentTurn.healing.push(row);
        currentTurn.events.push({ type: tag.slice(1), side: hpSide, pokemon: hpMon, hp: hpValue, text: raw });
        return;
      }

      if (tag === '-status' || tag === '-curestatus' || tag === '-boost' || tag === '-unboost') {
        var statusSlot = parts[2];
        currentTurn.status.push({ type: tag.slice(1), side: sideOf(statusSlot), pokemon: nameFromSlot(statusSlot), value: cleanText(parts[3]) });
        currentTurn.events.push({ type: tag.slice(1), side: sideOf(statusSlot), pokemon: nameFromSlot(statusSlot), text: raw });
        return;
      }

      if (tag === '-weather' || tag === '-fieldstart' || tag === '-fieldend' || tag === '-sidestart' || tag === '-sideend') {
        currentTurn.field.push({ type: tag.slice(1), value: cleanText(parts[2]), side: sideOf(parts[3] || '') });
        currentTurn.events.push({ type: tag.slice(1), text: raw });
        return;
      }

      if (tag === '-crit' || tag === '-miss' || tag === '-fail' || tag === '-immune') {
        var rngSlot = parts[2];
        currentTurn.rng.push({ type: tag.slice(1), side: sideOf(rngSlot), pokemon: nameFromSlot(rngSlot), value: cleanText(parts[3]) });
        currentTurn.events.push({ type: tag.slice(1), side: sideOf(rngSlot), pokemon: nameFromSlot(rngSlot), text: raw });
      }
    });

    model.leads.p1 = activeSeenBeforeTurnOne.p1.slice(0, 2);
    model.leads.p2 = activeSeenBeforeTurnOne.p2.slice(0, 2);
    if (!model.leads.p1.length && model.turns[0]) {
      model.leads.p1 = model.turns[0].switches.filter(function(s) { return s.side === 'p1'; }).map(function(s) { return s.pokemon; }).slice(0, 2);
      model.leads.p2 = model.turns[0].switches.filter(function(s) { return s.side === 'p2'; }).map(function(s) { return s.pokemon; }).slice(0, 2);
    }
    model.turns = model.turns.filter(function(t) { return t.number > 0 || t.events.length > 0; });
    if (!model.totalTurns && model.turns.length) model.totalTurns = model.turns[model.turns.length - 1].number || 0;

    var selectedName = model.players[selectedSide];
    var oppSide = selectedSide === 'p1' ? 'p2' : 'p1';
    if (model.result !== 'tie' && model.winner) {
      model.result = selectedName && model.winner === selectedName ? 'win' : 'loss';
    }
    if (!model.players.p1 && !model.players.p2) model.warnings.push('Player names were not found in the log.');
    if (!model.leads.p1.length || !model.leads.p2.length) model.warnings.push('Lead Pokemon could not be fully inferred.');
    if (!model.teamPreview.p1.length && !model.teamPreview.p2.length) model.warnings.push('Team preview was not present; selected Pokemon are inferred from revealed actions.');
    model.ok = model.turns.length > 0 || !!model.winner;
    model.opponentSide = oppSide;
    return model;
  }

  function classifyMove(move) {
    var m = cleanText(move).toLowerCase();
    if (!m) return 'unknown';
    if (m === 'protect' || m === 'detect' || m === 'spiky shield' || m === 'wide guard' || m === 'quick guard') return 'protection';
    if (m === 'fake out') return 'fake_out';
    if (m === 'tailwind' || m === 'trick room' || m === 'icy wind' || m === 'electroweb' || m === 'thunder wave') return 'speed_control';
    if (m === 'follow me' || m === 'rage powder') return 'redirection';
    if (m === 'swords dance' || m === 'nasty plot' || m === 'calm mind' || m === 'dragon dance') return 'setup';
    if (m === 'parting shot' || m === 'u-turn' || m === 'volt switch') return 'pivot';
    return 'attack_or_support';
  }

  function addIssue(issues, tag, severity, turn, message, confidence, recommendation) {
    issues.push({
      tag: tag,
      severity: severity,
      turn: turn || null,
      message: message,
      confidence: confidence || 'medium',
      recommendation: recommendation || ''
    });
  }

  function buildReplayCoachReview(parsed, opts) {
    opts = opts || {};
    var side = normalizeSide(opts.selectedSide || parsed.selectedSide || 'p1');
    var opp = side === 'p1' ? 'p2' : 'p1';
    var issues = [];
    var turnScores = {};
    var speedTurns = [];
    var userLead = parsed.leads[side] || [];
    var oppLead = parsed.leads[opp] || [];
    var userSelected = parsed.selectedPokemon[side] || [];
    var oppSelected = parsed.selectedPokemon[opp] || [];

    if (!userLead.length || !oppLead.length) {
      addIssue(issues, 'Lead Unclear', 'medium', null, 'The log does not expose a complete opening board.', 'medium', 'Use a full Showdown replay export when possible so lead coaching can be more precise.');
    }
    if (parsed.teamPreview[side] && parsed.teamPreview[side].length >= 6 && userSelected.length && userSelected.length < 4) {
      addIssue(issues, 'Bring-Four Unclear', 'low', null, 'Only part of your selected four could be inferred from revealed actions.', 'medium', 'Treat bring-four grades as incomplete until all brought Pokemon are revealed.');
    }

    parsed.turns.forEach(function(turn) {
      var userMoves = turn.moves.filter(function(m) { return m.side === side; });
      var oppMoves = turn.moves.filter(function(m) { return m.side === opp; });
      var userFaints = turn.faints.filter(function(f) { return f.side === side; });
      var oppFaints = turn.faints.filter(function(f) { return f.side === opp; });
      var userSpeed = userMoves.filter(function(m) { return classifyMove(m.move) === 'speed_control'; });
      var userProtect = userMoves.filter(function(m) { return classifyMove(m.move) === 'protection'; });
      var userFakeOut = userMoves.filter(function(m) { return classifyMove(m.move) === 'fake_out'; });
      var userSwitches = turn.switches.filter(function(s) { return s.side === side; });
      var oppSetupOrSpeed = oppMoves.filter(function(m) {
        var kind = classifyMove(m.move);
        return kind === 'setup' || kind === 'speed_control' || kind === 'redirection';
      });
      var userRngBad = turn.rng.filter(function(r) { return r.side === side && (r.type === 'miss' || r.type === 'fail'); });
      var oppRngGood = turn.rng.filter(function(r) { return r.side === opp && r.type === 'crit'; });

      if (userSpeed.length) {
        speedTurns.push(turn.number);
        if (!oppFaints.length && !turn.damage.some(function(d) { return d.side === opp && d.hp != null && d.hp < 75; })) {
          addIssue(issues, 'Speed Control Without Pressure', 'high', turn.number, 'You used speed control but did not immediately create clear damage or KO pressure.', 'medium', 'After Tailwind, Trick Room, Icy Wind, or Electroweb, convert the speed edge into a KO, forced Protect, or preserved win condition.');
        }
      }
      if (userProtect.length && oppSetupOrSpeed.length && !userFaints.length) {
        addIssue(issues, 'Passive Protect Turn', 'medium', turn.number, 'You protected while the opponent advanced setup, redirection, or speed control.', 'medium', 'Protect is strongest when it preserves the win condition, not when it gives the opponent a free board improvement.');
      }
      if (userFakeOut.length && turn.rng.some(function(r) { return r.type === 'fail' && r.side === side; })) {
        addIssue(issues, 'Fake Out Failed', 'medium', turn.number, 'Your Fake Out failed or was blocked.', 'high', 'Check Protect, Ghost typing, priority blocking, terrain, and move timing before leaning on Fake Out.');
      }
      if (userSwitches.length && oppSetupOrSpeed.length && !oppFaints.length) {
        addIssue(issues, 'Switch Tempo Loss', 'medium', turn.number, 'Your switch coincided with the opponent improving their board.', 'medium', 'Switches should either preserve a key piece, absorb a hit, or deny the opponent progress.');
      }
      if (userFaints.length && !oppFaints.length) {
        addIssue(issues, 'Lost Exchange', 'high', turn.number, 'You lost a Pokemon without taking one back that turn.', 'high', 'Review whether that Pokemon was still needed for speed control, pivoting, or endgame cleanup.');
      }
      if (userRngBad.length || oppRngGood.length) {
        addIssue(issues, 'RNG Materiality Check', 'low', turn.number, 'The turn included a miss, failed action, or critical hit that may have affected the line.', 'high', 'Separate bad luck from avoidable exposure: ask whether a safer line reduced reliance on that roll.');
      }
      turnScores[turn.number] = (turnScores[turn.number] || 0) + userFaints.length * 3 + oppSetupOrSpeed.length + userRngBad.length + oppRngGood.length;
    });

    var criticalTurn = null;
    var criticalScore = -1;
    Object.keys(turnScores).forEach(function(k) {
      if (turnScores[k] > criticalScore) {
        criticalScore = turnScores[k];
        criticalTurn = parseInt(k, 10);
      }
    });
    if (!criticalTurn && parsed.turns.length) criticalTurn = parsed.turns[0].number;

    var firstMistake = issues.find(function(i) { return i.turn != null && i.severity !== 'low'; }) || issues[0] || null;
    var fatalMistake = issues.filter(function(i) { return i.severity === 'high'; }).slice(-1)[0] || firstMistake;
    var confidence = parsed.warnings.length ? 'medium' : 'high';
    if (!parsed.ok) confidence = 'low';

    return {
      summary: {
        result: parsed.result,
        turns: parsed.totalTurns,
        winner: parsed.winner,
        yourSide: side,
        yourPlayer: parsed.players[side] || side,
        opponentPlayer: parsed.players[opp] || opp,
        yourLead: userLead,
        opponentLead: oppLead,
        yourFour: userSelected,
        opponentFour: oppSelected,
        leadGrade: userLead.length && oppLead.length ? 'Reviewable' : 'Unknown',
        criticalTurn: criticalTurn,
        mainIssue: firstMistake ? firstMistake.tag : 'No major issue detected',
        mainPracticePoint: firstMistake ? firstMistake.recommendation : 'Upload more logs to build a reliable player pattern.',
        confidence: confidence
      },
      coachingTags: issues.slice(0, 12),
      criticalTurn: {
        turn: criticalTurn,
        firstMistake: firstMistake,
        fatalMistake: fatalMistake,
        confidence: confidence
      },
      speedControl: {
        turnsUsed: speedTurns,
        note: speedTurns.length ? 'Review whether speed-control turns converted into pressure.' : 'No user speed-control move was detected.'
      },
      warnings: parsed.warnings.slice()
    };
  }

  function analyzeShowdownReplay(rawLog, opts) {
    var parsed = parseShowdownLog(rawLog, opts || {});
    return {
      parsed: parsed,
      review: buildReplayCoachReview(parsed, opts || {})
    };
  }

  ChampionsSim.replayCoach.parseShowdownLog = parseShowdownLog;
  ChampionsSim.replayCoach.buildReplayCoachReview = buildReplayCoachReview;
  ChampionsSim.replayCoach.analyzeShowdownReplay = analyzeShowdownReplay;

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChampionsSim.replayCoach;
  }
})(typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this));
