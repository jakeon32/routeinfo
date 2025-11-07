import { Router } from 'express';
import {
  getAllStations,
  getStationById,
  createStation,
  updateStation,
  deleteStation
} from '../controllers/stationController';

const router = Router();

// GET /api/stations - 모든 정거장 조회
router.get('/', getAllStations);

// GET /api/stations/:id - 특정 정거장 조회
router.get('/:id', getStationById);

// POST /api/stations - 정거장 생성
router.post('/', createStation);

// PUT /api/stations/:id - 정거장 수정
router.put('/:id', updateStation);

// DELETE /api/stations/:id - 정거장 삭제
router.delete('/:id', deleteStation);

export default router;
