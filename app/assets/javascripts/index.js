$(function() {
	/* Matrix Model for 6 x 7
	6	12	18	24	30	36	42
	5	11	17	23	29	35	41
	4	10	16	22	28	34	40
	3	9	15	21	27	33	39
	2	8	14	20	26	32	38
	1	7	13	19	25	31	37
	*/

	const row = 6;
	const col = 7;
	const maxMove = row * col;
	const winningMatch = 4;
	const players = {
		0: {
			flag: 0,
			name: 'Player 1'
		},
		1: {
			flag: 1,
			name: 'Player 2'
		}
	};

	var gameMode = "";
	var gameState = {};
	var currentPlayer = 0;
	var moveCount = 0;
	var didEnd = false;
	var lastMove = null;	

	renderBoard();

	$('.play-mode').click(function() {
		if (!gameMode) {
			var mode = $(this).data('mode');
			gameMode = mode;
			var player2Name = gameMode == 'ai' ? 'AI' : 'Player 2';
			$('.p2').html(player2Name);
			$('.play-mode').attr('disabled', 'disabled');
			$(this).removeAttr('disabled').addClass('btn-primary');
			hideMessage();

			animatePlayer();
		}
	});


	$('.circle').click(function() {
		if (!gameMode) {
			showMessage('error', 'Please select Game Mode!');
			return;
		}

		if (didEnd) {
			return;
		}

		var column = $(this).data('col');
		move(column);
	});

	$('#reset').click(function() {
		gameMode = "";
		gameState = {};
		currentPlayer = 0;
		moveCount = 0;
		didEnd = false;
		lastMove = null;

		hideMessage();

		$('.play-mode').removeAttr('disabled')
			.removeClass('btn-primary');

		$('.circle').removeClass('move-0 move-1 win');

		$(".p1, .p2").animate({
		    marginLeft: '0px',
		    height: '30px',
		    paddingTop: '5px'
		}, 300, function() {
			$(this).css('position', 'relative');
		});

		$(this).hide();
	});

	function animatePlayer() {
		var center = ($(window).width() / 2) - 100;
		center = currentPlayer ? center + 50 : center;
		var otherPlayer = currentPlayer ? 0 : 1;

		$(".p" + (otherPlayer+1)).animate({
		    marginLeft: '0px',
		    height: '30px',
		    paddingTop: '5px'
		}, 300, function() {
			$(this).css('position', 'relative');
		});

		$(".p" + (currentPlayer+1)).animate({
		    marginLeft: '-' + center + 'px',
		    height: '50px',
		    paddingTop: '15px'
		}, 300, function() {
			$(this).css('position', 'absolute');
		});
	}

	function renderBoard() {
		var board = "";
		for (var r = 1; r <= row; r++) {
			var c = 1;
			var point = r;
			var boardRows = "<ul class='row'>";
			while (c <= col) {
				boardRows += "<li class='cell'><div class='circle' data-point='" + point + "' data-col='" + c + "'></div></li>";
				point += row;
				c++;
			}
			boardRows += "</ul>";
			board = boardRows + board;
		}
		$('#board').html(board);
	}

	function markWinner(point) {
		for (var i = 0; i < point.length; i++) {
			$('div[data-point="' + point[i] + '"]').addClass('win');
		}
	}

	function isAvailableMove(column) {
		var topCol = row * column;
		var botCol = topCol - (row - 1);

		// get predicted move
		var move = null;
		for (var i = botCol; i <= topCol; i++) {
			if (gameState[i] == null) {
				move = i;
				break;
			}
		}

		return move;
	}

	function move(column) {
		var player = players[currentPlayer];

		var move = isAvailableMove(column);

		if (move != null) {
			moveCount++;
			lastMove = move;
			gameState[move] = currentPlayer;
			$('div[data-point="' + move + '"]').addClass('move-'+player['flag']);

			var vertical = checkVertical(move);
			var horizontal = checkHorizontal(move);
			var diagonalRight = checkDiagonalRight(move);
			var diagonalLeft = checkDiagonalLeft(move);

			if (vertical || horizontal || diagonalRight || diagonalLeft) {
				didEnd = true;
				showMessage('success', player['name'] + ' Wins!');
				$('#reset').css('display', 'block');
				return;
			}

			if (moveCount == maxMove) {
				showMessage('success', 'Draw');
				$('#reset').css('display', 'block');
				didEnd = true;
				return;
			}

			currentPlayer = currentPlayer ? 0 : 1;
			animatePlayer();
		}

		if (gameMode == 'ai' && currentPlayer == 1) {
			aiMove();
		}
	}

	function showMessage(type, msg) {
		var msgObj = $('#msg');
		msgObj.html(msg)
			.removeAttr("class");
		if (type == 'error') {
			msgObj.attr('class', 'bg-danger');
		} else if (type == 'success') {
			msgObj.attr('class', 'bg-success');
		}
		msgObj.css('visibility', 'visible');
	}

	function hideMessage() {
		$('#msg').css('visibility', 'hidden');
	}

	function checkVertical(move) {
		var player = players[currentPlayer];
		var minDown = (Math.ceil(move / row) * row) - (row - 1);
		var matchCount = 0;
		var matchPossibility = [];

		if ((((move - minDown) + 1) >= winningMatch) || gameMode == 'ai') {

			var checkFlag = true;
			var checkingPoint = move;
			while (checkFlag) {
				if (gameState[checkingPoint] == player['flag']) {
					matchCount++;
					matchPossibility.push(checkingPoint);
					checkingPoint--;
				} else {
					checkFlag = false;
				}

				if (matchCount == winningMatch) {
					markWinner(matchPossibility);
					return true;
				}

				if (checkingPoint < minDown) {
					return false;
				}
			}
		}

		return false;
	}

	function checkHorizontal(move) {
		var player = players[currentPlayer];
		var rightColMax = (maxMove - (move - 1)) / row;
		var matchCount = 1; // +1 current point
		var matchPossibility = [];
		matchPossibility.push(move);

		var checkFlag = true;
		var checkingPoint = move;

		// check from point to right
		while (checkFlag) {
			checkingPoint += row;

			if (checkingPoint > maxMove) {
				checkFlag = false;
				break;
			}

			if (gameState[checkingPoint] == player['flag']) {
				matchPossibility.push(checkingPoint);
				matchCount++;
			} else {
				checkFlag = false;
			}

			if (matchCount == winningMatch) {
				markWinner(matchPossibility);
				return true;
			}
		}

		// check from point to left
		checkFlag = true;
		checkingPoint = move;
		while (checkFlag) {
			checkingPoint -= row;

			if (checkingPoint < 0) {
				checkFlag = false;
				break;
			}

			if (gameState[checkingPoint] == player['flag']) {
				matchPossibility.push(checkingPoint);
				matchCount++;
			} else {
				checkFlag = false;
			}

			if (matchCount == winningMatch) {
				markWinner(matchPossibility);
				return true;
			}
		}

		return false;
	}

	function checkDiagonalRight(move) {
		var player = players[currentPlayer];
		var matchCount = 1; // +1 current point
		var matchPossibility = [];
		matchPossibility.push(move);

		var checkFlag = true;
		var checkingPoint = move;

		// check diagonal up
		if (checkingPoint % row != 0) {
			while (checkFlag) {
				checkingPoint += row + 1;

				if (checkingPoint > maxMove) {
					checkFlag = false;
					break;
				}

				if (gameState[checkingPoint] == player['flag']) {
					matchPossibility.push(checkingPoint);
					matchCount++;
				} else {
					checkFlag = false;
				}

				if (matchCount == winningMatch) {
					markWinner(matchPossibility);
					return true;
				}

				if ((checkingPoint % row) == 0) {
					checkFlag = false;
				}
			}
		}

		// check diagonal down
		checkFlag = true;
		checkingPoint = move;
		if (checkingPoint % row != 1) {
			while (checkFlag) {
				checkingPoint -= row + 1;

				if (checkingPoint < 0) {
					checkFlag = false;
					break;
				}

				if (gameState[checkingPoint] == player['flag']) {
					matchPossibility.push(checkingPoint);
					matchCount++;
				} else {
					checkFlag = false;
				}

				if (matchCount == winningMatch) {
					markWinner(matchPossibility);
					return true;
				}

				var minDown = (Math.ceil(checkingPoint / row) * row) - (row - 1);

				if (checkingPoint == minDown) {
					checkFlag = false;
				}
			}
		}

		return false;
	}

	function checkDiagonalLeft(move) {
		var player = players[currentPlayer];
		var matchCount = 1; // +1 current point
		var matchPossibility = [];
		matchPossibility.push(move);

		var checkFlag = true;
		var checkingPoint = move;

		// check diagonal up
		if (checkingPoint % row != 0) {
			while (checkFlag) {
				checkingPoint -= row - 1;

				if (checkingPoint < 0) {
					checkFlag = false;
					break;
				}

				if (gameState[checkingPoint] == player['flag']) {
					matchPossibility.push(checkingPoint);
					matchCount++;
				} else {
					checkFlag = false;
				}

				if (matchCount == winningMatch) {
					markWinner(matchPossibility);
					return true;
				}

				if ((checkingPoint % row) == 0) {
					checkFlag = false;
				}
			}
		}

		// check diagonal down
		checkFlag = true;
		checkingPoint = move;
		if (checkingPoint % row != 1) {
			while (checkFlag) {
				checkingPoint += row - 1;

				if (checkingPoint > maxMove) {
					checkFlag = false;
					break;
				}

				if (gameState[checkingPoint] == player['flag']) {
					matchPossibility.push(checkingPoint);
					matchCount++;
				} else {
					checkFlag = false;
				}

				if (matchCount == winningMatch) {
					markWinner(matchPossibility);
					return true;
				}

				var minDown = (Math.ceil(checkingPoint / row) * row) - (row - 1);

				if (checkingPoint == minDown) {
					checkFlag = false;
				}
			}
		}

		return false;
	}

	/*
		Check if AI has Winning move
		Check for human player Winning move
		Predict Humna player best move
		Find closest to human move
	*/

	function aiMove() {
		var ai = players[1];
		var player1 = players[0];
		var aiPredictedWinningMove = {};
		var player1PredictedMove = {};
		for (var i = 1; i <= col; i++) {
			player1PredictedMove[i] = doTest(player1['flag'], i);
			aiPredictedWinningMove[i] = doTest(ai['flag'], i);
		}

		// Find AI winning move
		for (var aiWin in aiPredictedWinningMove) {
			if (aiPredictedWinningMove[aiWin] && aiPredictedWinningMove[aiWin]['total'] == 0) {
				move(aiWin);
				return;
			}
		}

		// Counter PLayer 1 next winning move
		var counterWinningMove = null;
		var counterWinningMoveList = [];
		for (var cMove in player1PredictedMove) {
			if (player1PredictedMove[cMove]) {
				if (player1PredictedMove[cMove]['total'] == 0) {
					move(cMove);
					return;
				}

				if (counterWinningMove == null) {
					counterWinningMove = cMove;
					counterWinningMoveList.push({ move: cMove, test: player1PredictedMove[cMove]['test'] });
				} else if (player1PredictedMove[counterWinningMove]['total'] > player1PredictedMove[cMove]['total']) {
					counterWinningMove = cMove;
					counterWinningMoveList = [{ move: cMove, test: player1PredictedMove[cMove]['test'] }];
				} else if (player1PredictedMove[counterWinningMove]['total'] == player1PredictedMove[cMove]['total']) {
					counterWinningMoveList.push({ move: cMove, test: player1PredictedMove[cMove]['test'] });
				}
			}
		}

		if (counterWinningMoveList.length > 1) {

			// Find the move with the lowest points
			var bestWinningMoves = [];
			var bestWinningPoint = null;
			for (var i = 0; i < counterWinningMoveList.length; i++) {
				var nodeBest = null;
				for (var test in counterWinningMoveList[i]['test']) {
					if (nodeBest == null) {
						nodeBest = counterWinningMoveList[i]['test'][test];
					} else if (nodeBest > counterWinningMoveList[i]['test'][test]) {
						nodeBest = counterWinningMoveList[i]['test'][test];
					}
				}

				if (bestWinningPoint == null) {
					bestWinningPoint = nodeBest;
					bestWinningMoves.push(counterWinningMoveList[i]);
				} else if (bestWinningPoint > nodeBest) {
					bestWinningPoint = nodeBest;
					bestWinningMoves.push(counterWinningMoveList[i]);
				} else if (bestWinningPoint == nodeBest) {
					bestWinningMoves.push(counterWinningMoveList[i]);
				}
			}

			// find closest move
			if (bestWinningMoves.length > 1) {
				var closestMove = null;
				var closeDistance = null;
				for (var b = 0; b < bestWinningMoves.length; b++) {
					var movePoint = isAvailableMove(bestWinningMoves[b]['move']);
					var distance = Math.abs(lastMove - movePoint);
					if (closeDistance == null) {
						closeDistance = distance;
						closestMove = bestWinningMoves[b]['move'];
					} else if (closeDistance > distance) {
						 closeDistance = distance;
						 closestMove = bestWinningMoves[b]['move'];
					}
				}
				move(closestMove);
			} else {
				move(bestWinningMoves[0]['move']);
			}
		} else {
			move(counterWinningMoveList[0]['move']);
		}
	}

	function doTest(player, column) {
		var move = isAvailableMove(column);

		if (move != null) {
			var predictGameState = JSON.parse(JSON.stringify(gameState));
			predictGameState[move] = player;

			var vertical = predictVertical(player, move, predictGameState);
			var horizontal = predictHorizontal(player, move, predictGameState);
			var diagonalRight = predictDiagonalRight(player, move, predictGameState);
			var diagonalLeft = predictDiagonalLeft(player, move, predictGameState);

			var data = {
				test: {
					vertical: vertical,
					horizontal: horizontal,
					diagonalRight: diagonalRight,
					diagonalLeft: diagonalLeft
				},
				total: vertical + horizontal + diagonalRight + diagonalLeft
			};

			if (vertical == 0 || horizontal == 0 || diagonalRight == 0 || diagonalLeft == 0) {
				data['total'] = 0;
				return data;
			}

			return data;
		}
	}

	function predictVertical(player, move, predictGameState) {
		var minDown = (Math.ceil(move / row) * row) - (row - 1);
		var maxUp = minDown + (row -1);
		var matchCount = 0;
		var checkFlag = true;
		var checkingPoint = move;

		while (checkFlag) {
			if (predictGameState[checkingPoint] == player) {
				matchCount++;
				checkingPoint--;
			} else {
				checkFlag = false;
			}

			if (checkingPoint < minDown) {
				checkFlag = false;
			}

			if (matchCount == winningMatch) {
				return 0;
			}
		}

		// check for ramining moves if available
		var remainingMoves = winningMatch - matchCount;
		if (maxUp >= (move + remainingMoves)) {
			return remainingMoves;
		}
		return winningMatch;
	}

	function predictHorizontal(player, move, predictGameState) {
		var rightColMax = (maxMove - (move - 1)) / row;
		var matchCount = 1; // +1 current point
		var validMoves = 0;

		// check from point to right
		var checkFlag = true;
		var checkingPoint = move;
		var horizontalCount = 0;
		while (checkFlag) {
			horizontalCount++;
			checkingPoint += row;
			if (checkingPoint > maxMove || horizontalCount >= winningMatch) {
				checkFlag = false;
				break;
			}

			var minDown = (Math.ceil(checkingPoint / row) * row) - (row - 1);
			if (predictGameState[checkingPoint] == player) {
				matchCount++;
			} else if ((minDown < checkingPoint && predictGameState[checkingPoint] == null && predictGameState[checkingPoint-1] != null)
				|| (minDown == checkingPoint && predictGameState[checkingPoint] == null)) {
				validMoves++;
			} else {
				checkFlag = false;
			}

			if (matchCount == winningMatch) {
				return 0;
			}
		}

		// check from point to left
		checkFlag = true;
		checkingPoint = move;
		horizontalCount = 0;
		while (checkFlag) {
			horizontalCount++;
			checkingPoint -= row;
			if (checkingPoint < 0 || horizontalCount >= winningMatch) {
				checkFlag = false;
				break;
			}

			var minDown = (Math.ceil(checkingPoint / row) * row) - (row - 1);
			if (predictGameState[checkingPoint] == player) {
				matchCount++;
			} else if ((minDown < checkingPoint && predictGameState[checkingPoint] == null && predictGameState[checkingPoint-1] != null)
				|| (minDown == checkingPoint && predictGameState[checkingPoint] == null)) {
				validMoves++;
			} else {
				checkFlag = false;
			}

			if (matchCount == winningMatch) {
				return 0;
			}
		}

		// check remaining moves if available
		var remainingMoves = winningMatch - matchCount;

		if (validMoves >= remainingMoves) {
			return remainingMoves;
		}
		return winningMatch;
	}


	function predictDiagonalRight(player, move, predictGameState) {
		var matchCount = 1; // +1 current point
		var validMoves = 0;

		// check diagonal up
		var checkFlag = true;
		var checkingPoint = move;
		var diagonalCount = 0;
		if (checkingPoint % row != 0) {
			while (checkFlag) {
				diagonalCount++;
				checkingPoint += row + 1;

				if (checkingPoint > maxMove || diagonalCount >= winningMatch) {
					checkFlag = false;
					break;
				}

				var minDown = (Math.ceil(checkingPoint / row) * row) - (row - 1);
				var maxUp = minDown + (row -1);
				if (predictGameState[checkingPoint] == player) {
					matchCount++;
				} else if ((minDown < checkingPoint && checkingPoint <= maxUp && predictGameState[checkingPoint] == null && predictGameState[checkingPoint-1] != null)
					|| (minDown == checkingPoint && checkingPoint <= maxUp && predictGameState[checkingPoint] == null)) {
					validMoves++;
				} else {
					checkFlag = false;
				}

				if (matchCount == winningMatch) {
					return 0;
				}
			}
		}

		// check diagonal down
		checkFlag = true;
		checkingPoint = move;
		diagonalCount = 0;
		if (checkingPoint % row != 1) {
			while (checkFlag) {
				diagonalCount++;
				checkingPoint -= row + 1;

				if (checkingPoint < 0 || diagonalCount >= winningMatch) {
					checkFlag = false;
					break;
				}

				var minDown = (Math.ceil(checkingPoint / row) * row) - (row - 1);
				if (predictGameState[checkingPoint] == player) {
					matchCount++;
				} else if ((minDown < checkingPoint && predictGameState[checkingPoint] == null && predictGameState[checkingPoint-1] != null)
					|| (minDown == checkingPoint && predictGameState[checkingPoint] == null)) {
					validMoves++;
				} else {
					checkFlag = false;
				}

				if (matchCount == winningMatch) {
					return 0;
				}

				if (checkingPoint == minDown) {
					checkFlag = false;
				}
			}
		}

		// check remaining moves if available
		var remainingMoves = winningMatch - matchCount;

		if (validMoves >= remainingMoves) {
			return remainingMoves;
		}
		return winningMatch;
	}

	function predictDiagonalLeft(player, move, predictGameState) {
		var matchCount = 1; // +1 current point
		var validMoves = 0;

		// check diagonal up
		var checkFlag = true;
		var checkingPoint = move;
		var diagonalCount = 0;
		if (checkingPoint % row != 0) {
			while (checkFlag) {
				diagonalCount++;
				checkingPoint -= row - 1;

				if (checkingPoint < 0  || diagonalCount >= winningMatch) {
					checkFlag = false;
					break;
				}

				var minDown = (Math.ceil(checkingPoint / row) * row) - (row - 1);
				var maxUp = minDown + (row -1);
				if (predictGameState[checkingPoint] == player) {
					matchCount++;
				} else if ((minDown < checkingPoint && checkingPoint <= maxUp && predictGameState[checkingPoint] == null && predictGameState[checkingPoint-1] != null)
					|| (minDown == checkingPoint && checkingPoint <= maxUp && predictGameState[checkingPoint] == null)) {
					validMoves++;
				} else {
					checkFlag = false;
				}

				if (matchCount == winningMatch) {
					return 0;
				}

				if ((checkingPoint % row) == 0) {
					checkFlag = false;
				}
			}
		}

		// check diagonal down
		checkFlag = true;
		checkingPoint = move;
		diagonalCount = 0
		if (checkingPoint % row != 1) {
			while (checkFlag) {
				diagonalCount++;
				checkingPoint += row - 1;

				if (checkingPoint > maxMove || diagonalCount >= winningMatch) {
					checkFlag = false;
					break;
				}

				var minDown = (Math.ceil(checkingPoint / row) * row) - (row - 1);
				if (predictGameState[checkingPoint] == player) {
					matchCount++;
				} else if ((minDown < checkingPoint && predictGameState[checkingPoint] == null && predictGameState[checkingPoint-1] != null)
					|| (minDown == checkingPoint && predictGameState[checkingPoint] == null)) {
					validMoves++;
				} else {
					checkFlag = false;
				}

				if (matchCount == winningMatch) {
					return 0;
				}

				var minDown = (Math.ceil(checkingPoint / row) * row) - (row - 1);

				if (checkingPoint == minDown) {
					checkFlag = false;
				}
			}
		}

		// check remaining moves if available
		var remainingMoves = winningMatch - matchCount;

		if (validMoves >= remainingMoves) {
			return remainingMoves;
		}
		return winningMatch;
	}

});
