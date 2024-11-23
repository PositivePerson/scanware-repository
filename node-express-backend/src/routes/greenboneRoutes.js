const express = require('express');
const router = express.Router();
const greenboneController = require('../controllers/greenboneController');

// routes
router.post('/start-scan-from-api', greenboneController.postStartScan);
router.post('/schedule-scan-from-api', greenboneController.postScheduleScan);
router.post('/create-target-from-api', greenboneController.postCreateTarget);
router.post('/resume-task-from-api', greenboneController.postResumeTask);
router.post('/run-again-task-from-api', greenboneController.postRunAgainTask);
router.post('/schedule-recurring-scan-from-api', greenboneController.postScheduleRecurringScan);
router.post('/pause-task-from-api', greenboneController.postPauseTask);

router.get('/notify-completion-from-api', greenboneController.getNotifyCompletion);
router.get('/get-aggregates-from-api', greenboneController.getAggregates);
router.get('/tasks-by-severity-from-api', greenboneController.tasksBySeverity);
router.get('/nvt-by-severities-from-api', greenboneController.nvtBySeverities);
router.get('/', greenboneController.getResults);
router.get('/get-version-from-api', greenboneController.getVersion);
router.get('/test', greenboneController.getTest);
router.get('/test-from-api', greenboneController.getTestFromAPI);
router.get('/download-report-from-api', greenboneController.downloadReport);
router.get('/scan-result-from-api', greenboneController.getScanResult);
router.get('/scan-details-from-api', greenboneController.getScanDetails);
router.get('/scan-status-from-api', greenboneController.getScanStatus);
router.get('/target-scans-from-api', greenboneController.getTargetScans);
router.get('/all-scans-from-api', greenboneController.getAllScans);
router.get('/get-schedules-from-api', greenboneController.getSchedules);
router.get('/all-targets-from-api', greenboneController.getAllTargets);

router.delete('/delete-scan-from-api', greenboneController.deleteScan);
router.delete('/delete-schedule-from-api', greenboneController.deleteSchedule);
router.delete('/delete-target-from-api', greenboneController.deleteTarget);
// router.post('/', greenboneController.createScan);
// Add more routes as needed

module.exports = router;
