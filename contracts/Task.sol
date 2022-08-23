// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;
pragma experimental ABIEncoderV2;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./ERC20Helper.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * Wormhole remote task Database
 * This is a simple task list, project manager can publish a task to remote one of his twitter
 * He need to depost some ERC20 token to this contract
 * Then we write into the reward list after the end time
 */
contract Task is Ownable, ReentrancyGuard, ERC20Helper {
    using EnumerableSet for EnumerableSet.UintSet;
    // task status:
    // Openning: when user create a new task;
    // Pending: when we fill the user list;
    // Closed: The task finished, token distribute to the users;
    enum TaskState {
        Openning,
        Pending,
        Closed
    }

    struct RewardInfo {
        address user;
        uint256 amount;
    }

    uint256 constant BATCH_SIZE = 500;

    struct TaskInfo {
        uint256 endTime; // after this timestamp, the owner can change the state
        address owner; // who create this task
        address token; // the reward token
        uint256 amount; // reward amount
        TaskState taskState;
        uint256 id; // task id
        uint256 batchSize; // total batches
        uint256 currentBatch; // when owner trigger the distribution, he need to distribute batch by batch, this is record whitch batch he has distributed
    }

    // all tasks id
    uint256[] public taskIds;
    EnumerableSet.UintSet private openningTaskIds;
    EnumerableSet.UintSet private pendingTaskIds;

    // all tasks list
    mapping(uint256 => TaskInfo) private taskList;
    mapping(uint256 => RewardInfo[]) private rewardList; // filled by wormhole

    event NewTask(address indexed owner, address indexed token, uint256 amount, uint256 endTime);
    event Distribute(uint256 indexed id, uint256 count);
    event AdminFillTaskList(uint256 indexed id, uint256 count);
    event TaskStateChange(uint256 indexed id, uint8 state);

    constructor() {}

    // create a new task
    // every one can create a task
    function newTask(
        uint256 id,
        uint256 endTime,
        address token,
        uint256 amount
    ) public nonReentrant {
        require(taskList[id].endTime == 0, "Task has been created");
        require(ERC20(token).balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(endTime > block.timestamp, "Wrong end time");
        lockERC20(token, msg.sender, address(this), amount);

        taskList[id].endTime = endTime;
        taskList[id].owner = msg.sender;
        taskList[id].token = token;
        taskList[id].amount = amount;
        taskList[id].taskState = TaskState.Openning;
        taskList[id].id = id;

        taskIds.push(id);
        openningTaskIds.add(id);

        emit NewTask(msg.sender, token, amount, endTime);
    }

    function cleanList(uint256 id, uint256 limit) public onlyOwner {
        require(taskList[id].id == id, "Invalid task id");
        require(taskList[id].currentBatch == 0, "can't be cleared");
        uint256 len = limit;
        if (len >= rewardList[id].length) {
            len = rewardList[id].length;
        }
        while (len > 0) {
            rewardList[id].pop();
            len = rewardList[id].length;
        }
    }

    // Admin(wormhole) calculate the rewards list adn write into this contract batch by batch
    function commitList(
        uint256 id,
        address[] memory users,
        uint256[] memory amounts,
        bool isLast
    ) public nonReentrant onlyOwner {
        require(taskList[id].endTime > 0, "Task has not been created");
        require(taskList[id].endTime < block.timestamp, "Task has not finish");
        require(taskList[id].taskState == TaskState.Openning, "Task is not opening");
        require(users.length == amounts.length, "Wrong data");
        if (!isLast) {
            require(users.length == BATCH_SIZE);
        } else {
            taskList[id].taskState = TaskState.Pending;
            openningTaskIds.remove(id);
            pendingTaskIds.add(id);
            emit TaskStateChange(id, uint8(TaskState.Pending));
        }
        uint256 index = BATCH_SIZE * taskList[id].batchSize;
        uint256 total = 0;
        for (uint256 i = 0; i < users.length; i++) {
            rewardList[id][i + index].user = users[i];
            rewardList[id][i + index].amount = amounts[i];
            total += amounts[i];
            require(total <= taskList[id].amount, "Invalid reward amount");
        }

        taskList[id].batchSize += 1;
        emit AdminFillTaskList(id, users.length);
    }

    // The task creator trigger the distribution batch by batch
    function distribute(uint256 id) public nonReentrant {
        // require(taskList[id].owner == msg.sender, 'You are not the task creator');
        require(taskList[id].id == id, "Invalid task id");
        require(taskList[id].taskState == TaskState.Pending, "Cant distribute the task that not in pending state");
        uint256 index = taskList[id].currentBatch * BATCH_SIZE;

        if (taskList[id].currentBatch == taskList[id].batchSize - 1) {
            for (uint256 i = index; i < rewardList[id].length; i++) {
                releaseERC20(taskList[id].token, rewardList[id][i].user, rewardList[id][i].amount);
            }
            taskList[id].taskState = TaskState.Closed;
            openningTaskIds.remove(id);
            pendingTaskIds.remove(id);
            emit TaskStateChange(id, uint8(TaskState.Closed));
            emit Distribute(id, rewardList[id].length % BATCH_SIZE);
        } else {
            for (uint256 i = index; i < index + BATCH_SIZE; i++) {
                releaseERC20(taskList[id].token, rewardList[id][i].user, rewardList[id][i].amount);
            }
            taskList[id].currentBatch += 1;
            emit Distribute(id, BATCH_SIZE);
        }
    }

    // Get task's head info
    function taskInfo(uint256 id) public view returns (TaskInfo memory task, uint256 userCount) {
        task = taskList[id];
        userCount = rewardList[id].length;
    }

    function openningTasks() public view returns (uint256[] memory ids) {
        ids = openningTaskIds.values();
    }

    function pendingTasks() public view returns (uint256[] memory ids) {
        ids = pendingTaskIds.values();
    }

    function getRewardList(uint256 id, uint256 batch) public view returns (RewardInfo[] memory rewards) {
        TaskInfo storage task = taskList[id];
        if (task.taskState == TaskState.Openning || batch >= task.batchSize) {
            rewards = new RewardInfo[](0);
        }

        uint256 startIndex = batch * BATCH_SIZE;
        uint256 endIndex = batch == task.batchSize - 1 ? rewardList[id].length % BATCH_SIZE : (batch + 1) * BATCH_SIZE;
        uint256 j = 0;
        for (uint256 i = startIndex; i < endIndex; i++) {
            rewards[j] = rewardList[id][i];
            j += 1;
        }
    }
}
