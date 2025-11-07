import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Stop } from '../models/Stop';
import { Station } from '../models/Station';

const stopRepository = AppDataSource.getRepository(Stop);
const stationRepository = AppDataSource.getRepository(Station);

// 모든 승하차장 조회 (또는 특정 정거장의 승하차장)
export const getAllStops = async (req: Request, res: Response) => {
  try {
    const { stationId } = req.query;

    const whereCondition: any = {};
    if (stationId) {
      whereCondition.stationId = parseInt(stationId as string);
    }

    const stops = await stopRepository.find({
      where: whereCondition,
      relations: ['station'],
      order: {
        createdAt: 'DESC'
      }
    });

    res.json(stops);
  } catch (error) {
    console.error('Error fetching stops:', error);
    res.status(500).json({ message: 'Failed to fetch stops', error });
  }
};

// 특정 승하차장 조회
export const getStopById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const stop = await stopRepository.findOne({
      where: { stopId: parseInt(id) },
      relations: ['station']
    });

    if (!stop) {
      return res.status(404).json({ message: 'Stop not found' });
    }

    res.json(stop);
  } catch (error) {
    console.error('Error fetching stop:', error);
    res.status(500).json({ message: 'Failed to fetch stop', error });
  }
};

// 승하차장 생성
export const createStop = async (req: Request, res: Response) => {
  try {
    const {
      stationId,
      name,
      address,
      latitude,
      longitude,
      description,
      photoUrl
    } = req.body;

    // 필수 필드 검증
    if (!stationId || !name || !latitude || !longitude) {
      return res.status(400).json({
        message: 'Station ID, name, latitude, and longitude are required'
      });
    }

    // 정거장 존재 확인
    const station = await stationRepository.findOne({
      where: { stationId: parseInt(stationId) }
    });

    if (!station) {
      return res.status(400).json({ message: 'Station not found' });
    }

    const stop = stopRepository.create({
      stationId: parseInt(stationId),
      name,
      address,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      description,
      photoUrl
    });

    const savedStop = await stopRepository.save(stop);

    // 생성된 승하차장을 관계 포함해서 다시 조회
    const result = await stopRepository.findOne({
      where: { stopId: savedStop.stopId },
      relations: ['station']
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating stop:', error);
    res.status(500).json({ message: 'Failed to create stop', error });
  }
};

// 승하차장 수정
export const updateStop = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      address,
      latitude,
      longitude,
      description,
      photoUrl,
      isActive
    } = req.body;

    const stop = await stopRepository.findOne({
      where: { stopId: parseInt(id) }
    });

    if (!stop) {
      return res.status(404).json({ message: 'Stop not found' });
    }

    // 업데이트
    if (name !== undefined) stop.name = name;
    if (address !== undefined) stop.address = address;
    if (latitude !== undefined) stop.latitude = parseFloat(latitude);
    if (longitude !== undefined) stop.longitude = parseFloat(longitude);
    if (description !== undefined) stop.description = description;
    if (photoUrl !== undefined) stop.photoUrl = photoUrl;
    if (isActive !== undefined) stop.isActive = isActive;

    await stopRepository.save(stop);

    // 업데이트된 승하차장을 관계 포함해서 다시 조회
    const result = await stopRepository.findOne({
      where: { stopId: parseInt(id) },
      relations: ['station']
    });

    res.json(result);
  } catch (error) {
    console.error('Error updating stop:', error);
    res.status(500).json({ message: 'Failed to update stop', error });
  }
};

// 승하차장 삭제
export const deleteStop = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const stop = await stopRepository.findOne({
      where: { stopId: parseInt(id) }
    });

    if (!stop) {
      return res.status(404).json({ message: 'Stop not found' });
    }

    await stopRepository.remove(stop);

    res.json({ message: 'Stop deleted successfully' });
  } catch (error) {
    console.error('Error deleting stop:', error);
    res.status(500).json({ message: 'Failed to delete stop', error });
  }
};
