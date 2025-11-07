import { Router } from 'express';
import {
  getAllStops,
  getStopById,
  createStop,
  updateStop,
  deleteStop
} from '../controllers/stopController';

const router = Router();

// GET /api/stops - 모든 승하차장 조회 (쿼리로 stationId 필터링 가능)
router.get('/', getAllStops);

// GET /api/stops/:id - 특정 승하차장 조회
router.get('/:id', getStopById);

// POST /api/stops - 승하차장 생성
router.post('/', createStop);

// PUT /api/stops/:id - 승하차장 수정
router.put('/:id', updateStop);

// DELETE /api/stops/:id - 승하차장 삭제
router.delete('/:id', deleteStop);

export default router;
