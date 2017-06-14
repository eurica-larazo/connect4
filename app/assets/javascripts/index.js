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
	var aiMemory = {};
	var aiPoints = {};

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
		aiMemory = {};
		aiPoints = {};

		hideMessage();

		$('.play-mode').removeAttr('disabled')
			.removeClass('btn-primary');

		$('.circle').removeClass('move-0 move-1');

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

	function move(column) {
		var player = players[currentPlayer];

		var topCol = row * column;
		var botCol = topCol - (row - 1);

		var move = null;
		for (var i = botCol; i <= topCol; i++) {
			if (gameState[i] == null) {
				moveCount++;
				move = i;
				gameState[i] = currentPlayer;
				$('div[data-point="' + i + '"]').addClass('move-'+player['flag']);
				break;
			}
		}

		if (move != null) {
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

	function checkVertical(move, memory, testPlayer) {
		var player = testPlayer ? players[testPlayer] : players[currentPlayer];
		var minDown = (Math.ceil(move / row) * row) - (row - 1);
		var storedMemory = memory ? aiMemory[memory] : gameState;
		var matchCount = 0;

		if (((move - minDown) + 1) >= winningMatch) {

			var checkFlag = true;
			var checkingPoint = move;
			while (checkFlag) {
				if (storedMemory[checkingPoint] == player['flag']) {
					matchCount++;
					checkingPoint--;
				} else {
					checkFlag = false;
				}

				if (matchCount == winningMatch) {
					computeAiPoints(memory, matchCount);
					return true;
				}

				if (checkingPoint < minDown) {
					computeAiPoints(memory, matchCount);
					return false;
				}
			}
		}

		computeAiPoints(memory, matchCount);
		return false;
	}

	function checkHorizontal(move, memory, testPlayer) {
		var player = testPlayer ? players[testPlayer] : players[currentPlayer];
		var matrixMax = row * col;
		var rightColMax = (matrixMax - (move - 1)) / row;
		var matchCount = 1; // +1 current point
		var storedMemory = memory ? aiMemory[memory] : gameState;

		var checkFlag = true;
		var checkingPoint = move;

		// check from point to right
		while (checkFlag) {
			checkingPoint += row;

			if (checkingPoint > matrixMax) {
				checkFlag = false;
				break;
			}

			if (storedMemory[checkingPoint] == player['flag']) {
				matchCount++;
			} else {
				checkFlag = false;
			}

			if (matchCount == winningMatch) {
				computeAiPoints(memory, matchCount);
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

			if (storedMemory[checkingPoint] == player['flag']) {
				matchCount++;
			} else {
				checkFlag = false;
			}

			if (matchCount == winningMatch) {
				computeAiPoints(memory, matchCount);
				return true;
			}
		}
		computeAiPoints(memory, matchCount);
		return false;
	}

	function checkDiagonalRight(move, memory, testPlayer) {
		var player = testPlayer ? players[testPlayer] : players[currentPlayer];
		var matchCount = 1; // +1 current point
		var matrixMax = row * col;
		var storedMemory = memory ? aiMemory[memory] : gameState;

		var checkFlag = true;
		var checkingPoint = move;

		// check diagonal up
		while (checkFlag) {
			checkingPoint += row + 1;

			if (checkingPoint > matrixMax) {
				checkFlag = false;
				break;
			}

			if (storedMemory[checkingPoint] == player['flag']) {
				matchCount++;
			} else {
				checkFlag = false;
			}

			if (matchCount == winningMatch) {
				computeAiPoints(memory, matchCount);
				return true;
			}

			if ((checkingPoint % row) == 0) {
				checkFlag = false;
			}
		}

		// check diagonal down
		checkFlag = true;
		checkingPoint = move;
		while (checkFlag) {
			checkingPoint -= row + 1;

			if (checkingPoint < 0) {
				checkFlag = false;
				break;
			}

			if (storedMemory[checkingPoint] == player['flag']) {
				matchCount++;
			} else {
				checkFlag = false;
			}

			if (matchCount == winningMatch) {
				computeAiPoints(memory, matchCount);
				return true;
			}

			var minDown = (Math.ceil(checkingPoint / row) * row) - (row - 1);

			if (checkingPoint == minDown) {
				checkFlag = false;
			}
		}

		computeAiPoints(memory, matchCount);
		return false;
	}

	function checkDiagonalLeft(move, memory, testPlayer) {
		var player = testPlayer ? players[testPlayer] : players[currentPlayer];
		var matchCount = 1; // +1 current point
		var matrixMax = row * col;
		var storedMemory = memory ? aiMemory[memory] : gameState;

		var checkFlag = true;
		var checkingPoint = move;

		// check diagonal up
		while (checkFlag) {
			checkingPoint -= row - 1;

			if (checkingPoint < 0) {
				checkFlag = false;
				break;
			}

			if (storedMemory[checkingPoint] == player['flag']) {
				matchCount++;
			} else {
				checkFlag = false;
			}

			if (matchCount == winningMatch) {
				computeAiPoints(memory, matchCount);
				return true;
			}

			if ((checkingPoint % row) == 0) {
				checkFlag = false;
			}
		}

		// check diagonal down
		checkFlag = true;
		checkingPoint = move;
		while (checkFlag) {
			checkingPoint += row - 1;

			if (checkingPoint > matrixMax) {
				checkFlag = false;
				break;
			}

			if (storedMemory[checkingPoint] == player['flag']) {
				matchCount++;
			} else {
				checkFlag = false;
			}

			if (matchCount == winningMatch) {
				computeAiPoints(memory, matchCount);
				return true;
			}

			var minDown = (Math.ceil(checkingPoint / row) * row) - (row - 1);

			if (checkingPoint == minDown) {
				checkFlag = false;
			}
		}

		computeAiPoints(memory, matchCount);
		return false;
	}

	function aiMove() {
		for (var i = 1; i < col; i++) {
			aiMemory[i] = gameState;
			testMove(i, 0);
			// break;
		}
		console.log(aiPoints);
	}

	function computeAiPoints(memory, matchCount) {
		if (gameMode == 'ai' && memory) {
			aiPoints[memory] = aiPoints[memory] ? aiPoints[memory] + (matchCount - winningMatch) : (matchCount - winningMatch);
		}
	}

	function testMove(column, player) {
		var memory = column;
		var topCol = row * column;
		var botCol = topCol - (row - 1);

		var move = null;
		for (var i = botCol; i <= topCol; i++) {
			if (aiMemory[memory][i] != undefined && !aiMemory[memory][i+1]) {
				move = i;
				break;
			}
			// if (aiMemory[memory] == null) {
			// 	moveCount++;
			// 	move = i;
			// 	aiMemory[memory] = player;
			// 	break;
			// }
		}
		
		if (move != null) {
			var vertical = checkVertical(move, memory, player);
			var horizontal = checkHorizontal(move, memory, player);
			var diagonalRight = checkDiagonalRight(move, memory, player);
			var diagonalLeft = checkDiagonalLeft(move, memory, player);

			if (vertical || horizontal || diagonalRight || diagonalLeft) {
				return true;
			}
		}
		return false;
	}

});
